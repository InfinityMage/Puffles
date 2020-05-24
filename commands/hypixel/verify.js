const discord = require('discord.js');
const Database = require('better-sqlite3');
const db = new Database('././database.db');
const { getGuild, getPlayer, getPlayerByUUID } = require('../../util/hypixelAPI.js');
const { getRole, getMember } = require('../../util/discordObjects.js');
const { complexError } = require('../../util/error.js');

module.exports = {

    name: 'verify',
    usage: 'verify {Minecraft Username}',
    description: 'Verify your Minecraft account with your Discord account, as well as your guild membership.',
    module: 'hypixel',
    admin: false,
    dev: false,
    aliases: ['link'],
    examples: ['`verify InfinityMage` : link your discord account with the Minecraft account `InfinityMage`'],

    async execute (message, args, client) {

        let discordMember;
        let pronounyThing = 'Your';
        let invalid_msg;

        const settingsStmt = await db.prepare(`SELECT value FROM settings WHERE guild = ? AND setting = ?`);
        const verification_channel = await settingsStmt.get(message.guild.id, 'verification_channel');

        // If the command user is an admin (used for manual verifications of other players)
        if (message.member.hasPermission('MANAGE_GUILD') || client.config.bot_admins.includes(message.author.id)) {
            if (args[1]) {
                if (await getMember(message.guild, args[1])) {
                    discordMember = await getMember(message.guild, args[1])
                    pronounyThing = `<@${discordMember.id}>'s`;
                } else invalid_msg = await message.channel.send(complexError(`Invalid user.`));
            } else discordMember = message.member;
        } else discordMember = message.member;
        
        if (invalid_msg && message.channel.id === verification_channel.value) return invalid_msg.delete({timeout: 6000})
        else if (invalid_msg) return;

        const attemptingEmbed = new discord.MessageEmbed()
        .setColor(client.config.color.main)
        .setDescription(`⚙️ Verification » \`${discordMember.user.tag}\` to \`${args[0]}\``)
        const msg = await message.channel.send(attemptingEmbed);
        if (message.channel.id === verification_channel.value) msg.delete({timeout: 6000})
        const getlinkStmt = await db.prepare(`SELECT minecraftuuid FROM mc_linkings WHERE guild = ? AND user = ?`);

        if (!args[0]) {
            const guildPrefix = await settingsStmt.get(message.guild.id, 'prefix').value;
            return msg.edit('', {embed: complexError(`Invalid usage! Please use \`${guildPrefix}${this.usage}\``)});
        } else {

            let verifiedRoleID = await settingsStmt.get(message.guild.id, 'verified_mc_role');
            if (!verifiedRoleID || !getRole(message.guild, verifiedRoleID.value)) return msg.edit('', {embed: complexError(`There is no verified role. Please contact this Discord's administrators.`)});

            const player_data = await getPlayer(args[0], client.cache, true);
            if (!player_data) return msg.edit('', {embed: complexError(`An unexpected error occurred.`)});
            if (player_data.player === null) return msg.edit('', {embed: complexError(`Invalid player! Please input a valid Minecraft username.`)});

            if (!player_data.player.socialMedia || !player_data.player.socialMedia.links.DISCORD || player_data.player.socialMedia.links.DISCORD !== discordMember.user.tag) return msg.edit('', {embed: complexError(`Please make sure that your ingame Discord social media matches your Discord tag! This is available through the ingame profile menu.`)});

            let mc_uuid = player_data.player.uuid;

            const getLinkage = await getlinkStmt.get(message.guild.id, discordMember.id);
            if (getLinkage) {
                const getPreviousLink = await getPlayerByUUID(getLinkage.minecraftuuid, client.cache);
                if (!getPreviousLink.player) msg.edit('', {embed: complexError(`${pronounyThing} account has already been linked to \`Error: Invalid Account\`!`)});
                else msg.edit('', {embed: complexError(`${pronounyThing} account has already been linked to \`${getPreviousLink.player.displayname}\`!`)});
            }
            if(!discordMember.roles.cache.get(verifiedRoleID.value) && getLinkage) return discordMember.roles.add(verifiedRoleID.value);
            else if (discordMember.roles.cache.get(verifiedRoleID.value) && getLinkage) return;
            
            if (!getLinkage) {
                const insertVerifStmt = await db.prepare(`INSERT INTO mc_linkings (guild, user, minecraftuuid) VALUES (?, ?, ?)`);
                insertVerifStmt.run(message.guild.id, discordMember.id, mc_uuid);
                discordMember.roles.add(verifiedRoleID.value);
            }

            const successEmbed = new discord.MessageEmbed()
            .setColor(client.config.color.success)
            .setTitle(`Verified Minecraft Account`)
            .setDescription(`:white_check_mark: ${pronounyThing} Discord has been linked to the Minecraft account \`${player_data.player.displayname}\`.`)

            msg.edit('', {embed: successEmbed});

        }

    }

}
