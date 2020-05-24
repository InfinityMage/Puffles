const discord = require('discord.js')
const Database = require('better-sqlite3');
const db = new Database('./database.db');
const settings = require('../resources/json/settings.json');
const { getSetting } = require('../util/settingsData.js');
const { simpleError } = require('../util/error.js');

module.exports = async (client, message) => {

    // Ignore
    if(message.author.bot) return;
    if(message.channel.type !== 'text') return;

    const settingsStmt = await db.prepare(`SELECT value FROM settings WHERE guild = ? AND setting = ?`);
    const verification_channel = await settingsStmt.get(message.guild.id, 'verification_channel');

    if (verification_channel && message.channel.id === verification_channel.value) message.delete({timeout: 6000});

    let guildPrefix;
    guildPrefix = await settingsStmt.get(message.guild.id, 'prefix');

    if(!guildPrefix) {
        const setupPrefix = await db.prepare(`INSERT INTO settings (guild, setting, value, friendly_value) VALUES (?, ?, ?, ?)`);
        const defaultprefix = getSetting('prefix').default;
        guildPrefix = await setupPrefix.run(message.guild.id, 'prefix', defaultprefix, defaultprefix);
        guildPrefix = await settingsStmt.get(message.guild.id, 'prefix');
    }

    let casePrefix = null;
    let prefixes = [guildPrefix.value, `<@${client.user.id}>`, `<@!${client.user.id}>`];
    prefixes.forEach(p => {
        if (message.content.toLowerCase().startsWith(p)) casePrefix = p;
    });
    
    if(casePrefix === null) return;

    // Command handling
    const args = message.content.toLowerCase().slice(casePrefix.length).trim().split(/ +/g);
    const commandName = args.shift();
    const cmd = client.commands.get(commandName) || client.commands.find(c => c.aliases && c.aliases.includes(commandName));
    if (!cmd) return;

    if (cmd.dev && !client.config.dev_servers.includes(message.guild.id)) return simpleError(message);
    if (cmd.admin && !message.member.hasPermission('MANAGE_GUILD') && !client.config.bot_admins.includes(message.author.id)) return simpleError(message);

    if (message.channel.id === verification_channel.value && cmd.name !== 'verify') return simpleError(message);

    cmd.execute(message, args, client);

}