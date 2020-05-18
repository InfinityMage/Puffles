const discord = require('discord.js');
const Database = require('better-sqlite3');
const db = new Database('././database.db');
const { getGuild, getPlayer } = require('../../util/hypixelAPI.js');
const { getRole } = require('../../util/discordObjects.js');
const { complexError } = require('../../util/error.js');

module.exports = {

    name: 'verify',
    usage: 'verify {Minecraft Username}',
    description: 'Verify your Minecraft account with your Discord account, as well as your guild membership.',
    module: 'hypixel',
    admin: false,
    aliases: ['sync'],
    examples: [],

    async execute (message, args, client) {

        const settingsStmt = await db.prepare(`SELECT value FROM settings WHERE guild = ? AND setting = ?`);

        if (!args[0]) {
            const guildPrefix = await settingsStmt.get(message.guild.id, 'prefix').value;
            return message.channel.send(complexError(`Invalid usage! Please use \`${guildPrefix}${this.usage}\``));
        } else {

            let verifiedRoleID = await settingsStmt.get(message.guild.id, 'verified_mc_role');
            let memberRoleID = await settingsStmt.get(message.guild.id, 'guild_member_role');
            if (memberRoleID) memberRoleID = memberRoleID.value

            if (!verifiedRoleID) return message.channel.send(complexError(`There is no verified role. Please contact this Discord's administrators.`));
            else verifiedRoleID = verifiedRoleID.value;

            const verifiedRole = getRole(message.guild, verifiedRoleID);
            if (!verifiedRole) return message.channel.send(complexError(`There is no verified role. Please contact this Discord's administrators.`));

            if(message.member.roles.cache.get(verifiedRoleID) && message.member.roles.cache.get(memberRoleID)) return message.channel.send(complexError(`Your account has already been verified!`));

            const player_data = await getPlayer(args[0], client.cache, true);
            if (!player_data) return message.channel.send(complexError(`An unexpected error occurred.`));
            if (player_data.player === null) return message.channel.send(complexError(`Invalid player! Please input a valid Minecraft username.`));

            if (!player_data.player.socialMedia.links.DISCORD || player_data.player.socialMedia.links.DISCORD !== message.author.tag) return message.channel.send(complexError(`Please make sure that your ingame Discord social media matches your Discord tag! This is available through the ingame profile menu.`));

            // give player verified role
            else {

                message.member.roles.add(verifiedRole);

                const guildID = await settingsStmt.get(message.guild.id, 'hypixel_guild').value;
                if (guildID) {

                    let check_guild_member = false;
                    const guild_data = await getGuild(guildID, client.cache, true);
                    guild_data.guild.members.forEach(mem => {
                        if (mem.uuid === player_data.player.uuid) check_guild_member = true;
                    });

                    if (check_guild_member) {

                        if (!memberRoleID) return;

                        const memberRole = getRole(message.guild, memberRoleID);
                        if (!memberRole) return;
                        if(message.member.roles.cache.get(memberRoleID)) return;

                        message.member.roles.add(memberRole);

                    }

                }

                const successEmbed = new discord.MessageEmbed()
                .setColor(client.config.color.success)
                .setTitle(`Verified Minecraft Account`)
                .setDescription(`:white_check_mark: Your Discord has been linked to the Minecraft account \`${player_data.player.displayname}\`.`)

                message.channel.send(successEmbed)

            }

        }

    }

}