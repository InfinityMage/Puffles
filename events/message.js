const discord = require('discord.js')

module.exports = async (client, message) => {

    // Ignore
    if(message.author.bot) return;
    if(message.channel.type !== 'text') return;
    if(message.content.indexOf(client.config.prefix) !== 0) return;

    // Command handling
    const args = message.content.toLowerCase().slice(client.config.prefix.length).trim().split(/ +/g);
    const commandName = args.shift();
    const cmd = client.commands.get(commandName) || client.commands.find(c => c.aliases && c.aliases.includes(commandName));
    if(!cmd) return;

    cmd.execute(message, args, client);

}