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
    aliases: ['link'],
    examples: ['`verify InfinityMage` : link your discord account with the Minecraft account `InfinityMage`'],

    async execute (message, args, client) {

        const msg = await message.channel.send('`Attempting verification...`');
        const settingsStmt = await db.prepare(`SELECT value FROM settings WHERE guild = ? AND setting = ?`);
        const getlinkStmt = await db.prepare(`SELECT user FROM mc_linkings WHERE guild = ? AND user = ? AND minecraftuuid = ?`);

        if (!args[0]) {
            const guildPrefix = await settingsStmt.get(message.guild.id, 'prefix').value;
            return msg.edit('', {embed: complexError(`Invalid usage! Please use \`${guildPrefix}${this.usage}\``)});
        } else {

            let verifiedRoleID = await settingsStmt.get(message.guild.id, 'verified_mc_role').value;
            if (!verifiedRoleID || !getRole(message.guild, verifiedRoleID)) return message.channel.send(complexError(`There is no verified role. Please contact this Discord's administrators.`));

            const player_data = await getPlayer(args[0], client.cache, true);
            if (!player_data) return msg.edit('', {embed: complexError(`An unexpected error occurred.`)});
            if (player_data.player === null) return msg.edit('', {embed: complexError(`Invalid player! Please input a valid Minecraft username.`)});

            if (!player_data.player.socialMedia.links.DISCORD || player_data.player.socialMedia.links.DISCORD !== message.author.tag) return msg.edit('', {embed: complexError(`Please make sure that your ingame Discord social media matches your Discord tag! This is available through the ingame profile menu.`)});

            let mc_uuid = player_data.player.uuid;

            const getLinkage = await getlinkStmt.get(message.guild.id, message.author.id, mc_uuid);
            if (getLinkage) msg.edit('', {embed: complexError(`Your account has already been linked to \`${player_data.player.displayname}\`!`)});
            if(!message.member.roles.cache.get(verifiedRoleID) && getLinkage) return message.member.roles.add(verifiedRoleID);
            else if (message.member.roles.cache.get(verifiedRoleID) && getLinkage) return;
            
            if (!getLinkage) {
                const insertVerifStmt = await db.prepare(`INSERT INTO mc_linkings (guild, user, minecraftuuid) VALUES (?, ?, ?)`);
                insertVerifStmt.run(message.guild.id, message.author.id, mc_uuid);
                message.member.roles.add(verifiedRoleID);
            }

            const successEmbed = new discord.MessageEmbed()
            .setColor(client.config.color.success)
            .setTitle(`Verified Minecraft Account`)
            .setDescription(`:white_check_mark: Your Discord has been linked to the Minecraft account \`${player_data.player.displayname}\`.`)

            msg.edit('', {embed: successEmbed});

        }

    }

}