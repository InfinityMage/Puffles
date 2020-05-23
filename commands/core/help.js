const discord = require('discord.js');
const {complexError} = require('../../util/error.js');
const {renderEmoji} = require('../../util/text.js');
const Database = require('better-sqlite3');
const db = new Database('./database.db');

module.exports = {

    name: 'help',
    usage: 'help [command|module]',
    description: 'View command modules or get help on a specific command.',
    module: 'core',
    admin: false,
    dev: false,
    aliases: ['h', 'commands', 'modules'],
    examples: ['`help` : gives a list of modules', '`help ping` : displays information and usage on the ping command'],

    async execute (message, args, client) {

        const prefixStmt = await db.prepare(`SELECT value FROM settings WHERE guild = ? AND setting = ?`);
        const guildPrefix = await prefixStmt.get(message.guild.id, 'prefix').value;

        // default help menu
        if (!args[0]) {

            const help_embed = new discord.MessageEmbed()
            .setColor(client.config.color.main)
            .setDescription(`For more information on a specific command or module, please use \`${guildPrefix}help [command|module]\``)
            .setThumbnail(client.user.displayAvatarURL())
            .setTitle('**Puffles Help**')
            .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL())
            .setTimestamp()

            // get all modules and add to embed
            client.config.modules.forEach(mod => {
                let cmd_count = 0;
                client.commands.map(cmd => {if (mod.id.includes(cmd.module)) cmd_count += 1});

                help_embed.addField(`${renderEmoji(mod.emoji, client)} **${mod.friendly}**`, `\`${guildPrefix}help ${mod.id[0]}\` **[${cmd_count}]**`)

            });

            message.channel.send(help_embed);

        }

        // command or module help
        else {

            // determine whether the argument is a command or a module
            let query_module = null;

            client.config.modules.forEach(mod => {
                if (mod.id.includes(args[0])) query_module = mod;
            });

            // display module help
            if(query_module !== null) {

                const module_embed = new discord.MessageEmbed()
                .setColor(client.config.color.main)
                .setTitle(`**${query_module.friendly}**`)
                .setDescription(query_module.description + '\n\n' + `For more information on a command, use \`${guildPrefix}help [command]\`.`)
                .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL())
                .setTimestamp()

                const cmds = client.commands.map(cmd => {
                    if(!query_module.id.includes(cmd.module)) return null;
                    return cmd.name;
                });

                let commands = '';
                cmds.forEach(c => {
                    if (c === null) return;
                    commands += `\`${guildPrefix}${c}\`, `;
                });

                if (commands.length > 0) module_embed.addField('**Commands**', commands.slice(0, -2));
                else module_embed.addField('**Commands**', 'Sorry, there are no commmands available at this time.');

                message.channel.send(module_embed);

            }

            // display command help
            else {

                const cmd = client.commands.get(args[0]) || client.commands.find(c => c.aliases && c.aliases.includes(args[0]));
                if(!cmd) return message.channel.send(complexError(`Sorry, but I could not find a module or command called \`${args[0]}\`.`));

                const command_embed = new discord.MessageEmbed()
                .setColor(client.config.color.main)
                .setTitle(`**${guildPrefix}${cmd.name}**`)
                .setDescription(cmd.description)
                .addField('Usage', `\`${guildPrefix}${cmd.usage}\``)
                .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL())
                .setTimestamp()

                if (cmd.examples.length > 0) {
                    let final = '';
                    for (let x = 0; x < cmd.examples.length; x++) {
                        final += `${client.config.misc.emoji_numbers[x]} ${cmd.examples[x].replace('`', `\`${guildPrefix}`)}\n`;
                    }
                    command_embed.addField('Examples', final);
                }

                message.channel.send(command_embed);

            }


        }

    }

}