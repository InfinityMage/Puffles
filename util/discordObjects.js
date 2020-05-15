module.exports = {

    getRole: (guild, input) => {

        if (guild.roles.cache.get(input)) return guild.roles.cache.get(input);

        const matches = input.match(/^<@&(\d+)>$/);
        if (!matches) return;

        return guild.roles.cache.get(matches[1]);

    },

    getMember: (client, guild, input) => {
        
        

    }

}