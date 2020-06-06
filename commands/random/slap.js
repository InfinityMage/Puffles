const discord = require("discord.js");
const fetch = require("node-fetch");
const { complexError } = require("../../util/error");

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
        if (args[0] === undefined || args[0] === null) {
            await message.channel.send(
                complexError("You are missing an argument, use -help slap.")
            );
            return;
        }
        if (!args[0].startsWith("<@")) {
            await message.channel.send(
                complexError("Wrong argument, use -help slap.")
            );
            return;
        }
        if (args[0] === `<@${message.author.id}>`) {
            await message.channel.send(
                complexError("You can not slap yourself.")
            );
            return;
        }
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
        await message.channel.send(progressEmbed);
    },
};
