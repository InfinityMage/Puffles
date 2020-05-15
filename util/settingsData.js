const settings = require('../resources/json/settings.json');

module.exports = {

    getSetting: (name) => {
        let defaultval;
        settings.forEach(s => {
            if (s.name === name) defaultval = s;
        });
        return defaultval;
    }

}