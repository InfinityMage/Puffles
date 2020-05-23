const Database = require('better-sqlite3');
const db = new Database('./database.db');
const guildMemberLinker = require ('../processes/guildMemberLinker.js');

module.exports = async (client) => {

    console.log(`\n\n-----------------------\n\nLogged in as ${client.user.tag}\n\n-----------------------\n\n`);

    client.user.setActivity('with Penguins', {type: 'PLAYING'});

    const settingsStmt = db.prepare('CREATE TABLE IF NOT EXISTS settings (guild TEXT, setting TEXT, value TEXT, friendly_value TEXT)');
    settingsStmt.run();

    const mcLink = db.prepare('CREATE TABLE IF NOT EXISTS mc_linkings (guild TEXT, user TEXT, minecraftuuid TEXT)');
    mcLink.run();

    const guildMemberLink = function () {
        console.log(`Running guild member linking system...`)
        client.guilds.cache.forEach(g => {
            guildMemberLinker.run(g, client);
        });
    }

    setInterval(guildMemberLink, 60000);

};