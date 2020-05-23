const { getGuild } = require('../util/hypixelAPI.js');
const { getRole } = require('../util/discordObjects.js');
const Database = require('better-sqlite3');
const db = new Database('./database.db');

module.exports = {

    run: async (guild, client) => {
        const settingsStmt = await db.prepare(`SELECT value FROM settings WHERE guild = ? AND setting = ?`);
        const guildID = await settingsStmt.get(guild.id, 'hypixel_guild');

        let hypixel_members = await getGuild(guildID.value, client.cache, true);
        if (!hypixel_members || !hypixel_members.guild.members) return console.log('An error occured [GUILD_MEMBER_LINKER_NO_GUILD_DATA]')
        hypixel_members = hypixel_members.guild.members;

        let valid_member_role = false;
        let valid_nonmember_role = false;
        const memberRoleID = await settingsStmt.get(guild.id, 'guild_member_role');
        const nonMemberRoleID = await settingsStmt.get(guild.id, 'non_guild_member_role');
        
        if (memberRoleID && memberRoleID.value && await getRole(guild, memberRoleID.value)) valid_member_role = true;
        if (nonMemberRoleID && nonMemberRoleID.value && await getRole(guild, nonMemberRoleID.value)) valid_nonmember_role = true;
        if (!valid_member_role && !valid_nonmember_role) return console.log('An error occured [GUILD_MEMBER_LINKER_NO_ROLES]');

        const getLinkStmt = await db.prepare(`SELECT minecraftuuid FROM mc_linkings WHERE guild = ? AND user = ?`);

        guild.members.cache.forEach(mem => {

            let check_guild_member = false;
            const getLink = getLinkStmt.get(guild.id, mem.id);
            if (!getLink) return;

            hypixel_members.forEach(hm => {
                if (hm.uuid === getLink.minecraftuuid) check_guild_member = true;
            });

            if (check_guild_member) {
                if (valid_member_role && !mem.roles.cache.get(memberRoleID.value)) mem.roles.add(memberRoleID.value);
                if (valid_nonmember_role && mem.roles.cache.get(nonMemberRoleID.value)) mem.roles.remove(nonMemberRoleID.value);
            } else {
                if (valid_member_role && mem.roles.cache.get(memberRoleID.value)) mem.roles.remove(memberRoleID.value);
                if (valid_nonmember_role && !mem.roles.cache.get(nonMemberRoleID.value)) mem.roles.add(nonMemberRoleID.value);
            }

        });

    }

}