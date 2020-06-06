const discord = require("discord.js");
const fetch = require("node-fetch");
const { complexError } = require("../../util/error");

module.exports = {
    name: "pat",
    usage: "pat",
    description: "Pat someone.",
    module: "random",
    admin: false,
    dev: false,
    aliases: [],
    examples: ["pat @Vert3xo#2666"],

    async execute(message, args, client) {
        if (args[0] === undefined || args[0] === null) {
            await message.channel.send(
                complexError("You are missing an argument, use -help pat.")
            );
            return;
        }
        if (!args[0].startsWith("<@")) {
            await message.channel.send(
                complexError("Wrong argument, use -help pat.")
            );
            return;
        }
        if (args[0] === `<@${message.author.id}>`) {
            await message.channel.send(
                complexError("You can not pat yourself.")
            );
            return;
        }
        const url = fetch("https://neko-love.xyz/api/v1/pat")
            .then((res) => res.json())
            .then((json) => json.url);
        const progressEmbed = new discord.MessageEmbed()
            .setColor(client.config.color.main)
            .setDescription("Pat")
            .addField("**Pat**", `${message.author.username} patted ${args[0]}`)
            .setImage(await url);
        await message.channel.send(progressEmbed);
    },
};
