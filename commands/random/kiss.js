const discord = require("discord.js");
const fetch = require("node-fetch");
const { complexError } = require("../../util/error");
const Database = require("better-sqlite3");
const db = new Database("././database.db");
const { getMember } = require("../../util/discordObjects");

module.exports = {
    name: "kiss",
    usage: "kiss <user>",
    description: "Kiss someone.",
    module: "random",
    admin: false,
    dev: false,
    aliases: [],
    examples: ["kiss @Vert3xo#2666"],

    async execute(message, args, client) {
        if (
            args[0] === `<@${message.author.id}>` ||
            args[0] === `<@!${message.author.id}>`
        ) {
            await message.channel.send(
                complexError("You can not kiss yourself.")
            );
            return;
        }
        if (
            args[0] === undefined ||
            args[0] === null ||
            (await getMember(message.guild, args[0])) === undefined
        ) {
            const prefixStmt = await db.prepare(
                `SELECT value FROM settings WHERE guild = ? AND setting = ?`
            );
            const guildPrefix = await prefixStmt.get(message.guild.id, "prefix")
                .value;
            await message.channel.send(
                complexError(
                    `Invalid usage! Please use \`${guildPrefix}${this.usage}\``
                )
            );
            return;
        }
        const url = fetch("https://neko-love.xyz/api/v1/kiss")
            .then((res) => res.json())
            .then((json) => json.url);
        const progressEmbed = new discord.MessageEmbed()
            .setColor(client.config.color.main)
            .addField("**Kiss**", `${message.author.username} kiss ${args[0]}`)
            .setImage(await url);
        await message.channel.send(progressEmbed);
    },
};
