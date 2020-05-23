const discord = require('discord.js');
const Database = require('better-sqlite3');
const db = new Database('././database.db');
const { complexError } = require('../../util/error');
const { getSetting } = require('../../util/settingsData.js');
const { getRole } = require('../../util/discordObjects.js')
const { getGuild } = require('../../util/hypixelAPI.js')
const settings = require('../../resources/json/settings.json');

module.exports = {

    name: 'settings',
    usage: 'settings {set/get/list} [setting] [value]',
    description: 'View or change the bot\'s settings. Using `set` with no entered value will reset the setting to its default value.',
    module: 'core',
    admin: true,
    dev: false,
    aliases: ['config', 'options'],
    examples: ['`settings set prefix ;;` : sets the bot\'s prefix to `;;`', '`settings get ticket_manager_role` : will return whatever role is currently managing tickets', '`settings list` : get a list of all the available settings you can change'],

    async execute (message, args, client) {

        const prefixStmt = await db.prepare(`SELECT value FROM settings WHERE guild = ? AND setting = ?`);
        const guildPrefix = await prefixStmt.get(message.guild.id, 'prefix').value;

        if (args[0] === 'list') {

            const settingsEmbed = new discord.MessageEmbed()
            .setColor(client.config.color.main)
            .setTitle('**Available Settings**')
            .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL())
            .setDescription(`To change a setting, use the command \`${guildPrefix}settings set [setting] [value]\`.`)
            .setTimestamp()

            let settings_list = '';

            settings.forEach(set => {
                settings_list = settings_list + `\`${set.name}\`: ${set.description}\n`;
            });

            settingsEmbed.addField(`Settings`, settings_list);

            message.channel.send(settingsEmbed);

        }

        else if (args[0] === 'set') {
            
            if (!args[1]) return message.channel.send(complexError(`You must enter the setting you want to change. Please use \`${guildPrefix}settings list\` for a list of available settings.`));

            const settingMeta = getSetting(args[1]);

            if (!settingMeta) return message.channel.send(complexError(`There is no available setting called \`${args[1]}\`. Please use \`${guildPrefix}settings list\` for a list of available settings.`));

            if (!args[2]) args[2] = settingMeta.default;

            let rawinput;
            let friendlyinput;

            if(settingMeta.type === "Discord Role ID") {
                const attemptRole = await getRole(message.guild, args[2]);
                if (!attemptRole) return message.channel.send(complexError(`That is an invalid discord role! Please make sure to either ping the role or send the role ID.`));
                rawinput = attemptRole.id;
                friendlyinput = `<@&${attemptRole.id}>`;
            }

            else if (settingMeta.name === "prefix") {
                if (args[2].length > settingMeta.max_length) return message.channel.send(complexError(`That prefix is too long! That maximum prefix length is \`${settingMeta.max_length}\` characters.`));
                rawinput = args[2];
                friendlyinput = `\`${args[2]}\``;
            }

            else if (settingMeta.type === "Hypixel Guild ID") {
                const guild_data = await getGuild(args[2], client.cache);
                if (guild_data === 'bad_id') return message.channel.send(complexError(`Please provide a valid Hypixel guild ID.`));
                if (!guild_data) return message.channel.send(complexError(`An unexpected error occurred.`));
                rawinput = args[2];
                friendlyinput = `**${guild_data.guild.name}** [${args[2]}]`;
            }

            const getSetStmt = await db.prepare(`SELECT value, friendly_value FROM settings WHERE guild = ? AND setting = ?`);
            let settingsValue = await getSetStmt.get(message.guild.id, args[1]);

            if (!settingsValue) {
                const createSet = await db.prepare(`INSERT INTO settings (guild, setting, value, friendly_value) VALUES (?, ?, ?, ?)`);
                await createSet.run(message.guild.id, args[1], rawinput, friendlyinput);
            } else {
                const updateStmt = await db.prepare(`UPDATE settings SET value = ?, friendly_value = ? WHERE guild = ? and setting = ?`);
                await updateStmt.run(rawinput, friendlyinput, message.guild.id, args[1]);
            }

            const changedSetting = new discord.MessageEmbed()
            .setColor(client.config.color.main)
            .setTitle(`**Updated Setting**`)
            .setFooter(`Setting changed by ${message.author.tag}`, message.author.displayAvatarURL())
            .setDescription(`The \`${args[1]}\` setting has now been changed to ${friendlyinput}.`)
            .setTimestamp()

            message.channel.send(changedSetting);

        }

        else if (args[0] === 'get') {

            if (!args[1]) return message.channel.send(complexError(`You must enter the setting you want to change. Please use \`${guildPrefix}settings list\` for a list of available settings.`));

            if (!getSetting(args[1])) return message.channel.send(complexError(`There is no available setting called \`${args[1]}\`. Please use \`${guildPrefix}settings list\` for a list of available settings.`));

            const getSetStmt = await db.prepare(`SELECT friendly_value FROM settings WHERE guild = ? AND setting = ?`);
            let settingsValue = await getSetStmt.get(message.guild.id, args[1]);

            if (!settingsValue) {
                const createSet = await db.prepare(`INSERT INTO settings (guild, setting, value, friendly_value) VALUES (?, ?, ?, ?)`);
                await createSet.run(message.guild.id, args[1], getSetting(args[1]).default, getSetting(args[1]).default);
                settingsValue = await getSetStmt.get(message.guild.id, args[1]);
            }

            if (settingsValue.friendly_value === "") settingsValue.friendly_value = "none";

            const displaySetting = new discord.MessageEmbed()
            .setColor(client.config.color.main)
            .setTitle(`**${args[1]} Setting**`)
            .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL())
            .setDescription(`To change the \`${args[1]}\` setting, please use the commands \`${guildPrefix}settings set ${args[1]} [value]\`.`)
            .addField(`Current Value`, settingsValue.friendly_value)
            .setTimestamp()

            message.channel.send(displaySetting);

        }

        else {

            return message.channel.send(complexError(`Invalid usage! Please use \`${guildPrefix}${this.usage}\``));

        }

    }

}