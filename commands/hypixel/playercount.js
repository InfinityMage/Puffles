const discord = require('discord.js');
const fetch = require('node-fetch');
const auth = require('../../auth.json');

module.exports = {

    name: 'playercount',
    usage: 'playercount',
    description: 'Show the current number of online players on Hypixel.',
    module: 'hypixel',
    aliases: [],
    examples: [],

    execute (message, args, client) {

        const countEmbed = new discord.MessageEmbed()
        .setColor(client.config.color.main)
        .setTitle('Total Online Players')
        .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL())
        .setTimestamp()

        fetch('https://api.hypixel.net/gameCounts?key='+auth.HYPIXEL_API_KEY)
        .then(res => res.json())
        .then(json => {
            countEmbed.setDescription(`**Total Online Players:** ${json.playerCount}\n\n**SkyBlock Players:** ${json.games.SKYBLOCK.players}\n**BedWars Players:** ${json.games.BEDWARS.players}\n**SkyWars Players:** ${json.games.SKYWARS.players}`);
            message.channel.send(countEmbed);
        });

    }

}