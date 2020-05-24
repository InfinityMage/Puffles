const discord = require('discord.js');
const config = require('../config.json')

module.exports = {

    simpleError: (msg) => {
        msg.react('❌');
    },

    complexError: (msg) => {
        const errorEmbed = new discord.MessageEmbed()
        .setTitle(`PUFFLES ERROR`)
        .setColor(config.color.error)
        .setDescription(msg)

        return errorEmbed;
    }

}
