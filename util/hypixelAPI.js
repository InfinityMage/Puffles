const fetch = require('node-fetch');
const auth = require('../auth.json');

module.exports = {

    hypixelAPI: async (request) => {
        // request should just be the url without base or key
        var response;
        await fetch('https://api.hypixel.net'+request+'&key='+auth.HYPIXEL_API_KEY).then(res => res.json()).then(json => {response = json;});
        if (!response.success) return false; // this should only happen if the API key gets throttled
        return response;
    }

}