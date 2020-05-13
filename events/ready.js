const Database = require('better-sqlite3');
const db = new Database('./database.db', { verbose: console.log });

module.exports = async (client) => {

    console.log(`\n\n-----------------------\n\nLogged in as ${client.user.tag}\n\n-----------------------\n\n`);

    client.user.setActivity('with Penguins', {type: 'PLAYING'});

    const settingsStmt = db.prepare('CREATE TABLE IF NOT EXISTS settings (guild TEXT, setting TEXT, value TEXT)');
    settingsStmt.run();

};