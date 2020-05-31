const discord = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
    name: "slap",
    usage: "slap",
    description: "Slap someone.",
    module: "random",
    admin: false,
    dev: false,
    aliases: [],
    examples: ["slap @Vert3xo#2666"],

    async execute(message, args, client) {
        const url = fetch("https://neko-love.xyz/api/v1/slap")
            .then((res) => res.json())
            .then((json) => json.url);
        const progressEmbed = new discord.MessageEmbed()
            .setColor(client.config.color.main)
            .setDescription(`✋ Slap`)
            .addField(
                "**Slap**",
                `${message.author.username} slapped ${args[0]}`
            )
            .setImage(await url);
        // console.log(await url);
        const msg = await message.channel.send(progressEmbed);
    },
};
