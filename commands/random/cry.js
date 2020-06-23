const discord = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
    name: "cry",
    usage: "cry",
    description: "Cry.",
    module: "random",
    admin: false,
    dev: false,
    aliases: [],
    examples: [],

    async execute(message, args, client) {
        const url = fetch("https://neko-love.xyz/api/v1/cry")
            .then((res) => res.json())
            .then((json) => json.url);
        const progressEmbed = new discord.MessageEmbed()
            .setColor(client.config.color.main)
            .addField(
                "**😢 Cry**",
                `${message.author.username} started crying.`
            )
            .setImage(await url);
        await message.channel.send(progressEmbed);
    },
};
