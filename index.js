const fs = require('fs');
const discord = require('discord.js');
const client = new discord.Client();
client.commands = new discord.Collection();
client.config = require('./config.json');
const auth = require('./auth.json');
const NodeCache = require('node-cache');
client.cache = new NodeCache({stdTTL: client.config.cache_time});

// Load events
fs.readdirSync('./events').forEach(file => {
    const event = require(`./events/${file}`);
    client.on(file.split('.')[0], event.bind(null, client));
    console.log(`Loaded Event: ${file}`);
});

let commandFiles = [];
let searching = true;
let dirBuilder = ['./commands'];
while (searching) {
    fs.readdirSync(dirBuilder[0]).forEach(f => {
        if (f.slice(-3) === '.js') return commandFiles.push(dirBuilder[0]+'/'+f);
        if (!f.includes('.')) {
            dirBuilder.push(dirBuilder[0]+'/'+f);
        }
    });
    dirBuilder.shift();
    if(dirBuilder.length === 0) searching = false;
}

commandFiles.forEach(cmd => {
    const command = require(cmd);
    client.commands.set(command.name, command);
    console.log(`Loaded Commands: ${command.name}`);
});

client.login(auth.DISCORD_TOKEN);