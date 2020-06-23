const discord = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
    name: "smug",
    usage: "smug",
    description: "Be smug.",
    module: "random",
    admin: false,
    dev: false,
    aliases: [],
    examples: [],

    async execute(message, args, client) {
        const url = fetch("https://neko-love.xyz/api/v1/smug")
            .then((res) => res.json())
            .then((json) => json.url);
        const progressEmbed = new discord.MessageEmbed()
            .setColor(client.config.color.main)
            .addField(
                "**😏 Smug**",
                `${message.author.username} is being smug.`
            )
            .setImage(await url);
        await message.channel.send(progressEmbed);
    },
};
