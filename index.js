const fs = require('fs');
const discord = require('discord.js');
const client = new discord.Client();
client.commands = new discord.Collection();
client.config = require('./config.json');
const auth = require('./auth.json')

// Load events
fs.readdirSync('./events').forEach(file => {
    const event = require(`./events/${file}`);
    client.on(file.split('.')[0], event.bind(null, client));
    console.log(`Loaded Event: ${file}`);
});

// Load commands
fs.readdirSync('./commands').forEach(folder => {
    fs.readdirSync(`./commands/${folder}`).forEach(file => {
        const command = require(`./commands/${folder}/${file}`);
        client.commands.set(command.name, command);
        console.log(`Loaded Command: ${command.name}`);
    });
});

client.login(auth.DISCORD_TOKEN);