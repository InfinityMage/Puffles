const fetch = require('node-fetch');
const auth = require('../auth.json');

module.exports = {

    customHypixelReq: async (request) => {
        // request should just be the url without base or key
        var response;
        await fetch('https://api.hypixel.net/'+request+auth.HYPIXEL_API_KEY).then(res => res.json()).then(json => {response = json;});
        if (!response.success) return false; // this should only happen if the API key gets throttled
        return response;
    },

    // denyCacheRetrieve is a boolean option about whether or not to retrieve the data from the cache, or get it fresh from the API
    getGuild: async (guild_id, cache, denyCacheRetrieve) => {

        let guild_data;

        if (cache.has('HYPIXEL_GUILD_'+guild_id) && !denyCacheRetrieve) guild_data = cache.get('HYPIXEL_GUILD_'+guild_id);
        else {
            await fetch('https://api.hypixel.net/guild?id='+guild_id+'&key='+auth.HYPIXEL_API_KEY).then(res => res.json()).then(json => {guild_data = json;});
            if (guild_data.success) cache.set('HYPIXEL_GUILD_'+guild_id, guild_data);
        }
        // failed to get data from API
        if (!guild_data.success && guild_data.cause === 'Malformed guild ID') return 'bad_id';

        if (!guild_data.success) return;

        return guild_data;

    },

    // denyCacheRetrieve is a boolean option about whether or not to retrieve the data from the cache
    getPlayer: async (player_name, cache, denyCacheRetrieve) => {

        let player_data;

        if (cache.has('HYPIXEL_PLAYER_'+player_name) && !denyCacheRetrieve) player_data = cache.get('HYPIXEL_GUILD_'+player_name);
        else {
            await fetch('https://api.hypixel.net/player?name='+player_name+'&key='+auth.HYPIXEL_API_KEY).then(res => res.json()).then(json => {player_data = json;});
            if (player_data.success) cache.set('HYPIXEL_GUILD_'+player_name, player_data);
        }
        // failed to get data from API
        if (!player_data.success && player_data.cause === 'Malformed guild ID') return 'bad_id';

        if (!player_data.success) return;

        return player_data;

    }

}