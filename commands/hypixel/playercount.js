const discord = require('discord.js');
const { customHypixelReq } = require('../../util/hypixelAPI.js')

module.exports = {

    name: 'playercount',
    usage: 'playercount',
    description: 'Show the current number of online players on Hypixel.',
    module: 'hypixel',
    admin: false,
    dev: false,
    aliases: [],
    examples: [],

    async execute (message, args, client) {

        const countEmbed = new discord.MessageEmbed()
        .setColor(client.config.color.main)
        .setTitle('Players | HYPIXEL NETWORK')
        .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL())
        .setTimestamp()

        const counts = await customHypixelReq('gameCounts?key=')

        countEmbed.setDescription(`» **Total Online Players:** ${counts.playerCount}\n━━━━━━━━━━━━━\n» **SkyBlock Players:** ${counts.games.SKYBLOCK.players}\n» **BedWars Players:** ${counts.games.BEDWARS.players}\n» **SkyWars Players:** ${counts.games.SKYWARS.players}`);
        return message.channel.send(countEmbed);

    }

}
