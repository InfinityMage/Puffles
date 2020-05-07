module.exports = async (client) => {

    console.log(`\n\n-----------------------\n\nLogged in as ${client.user.tag}\n\n-----------------------\n\n`);

    client.user.setActivity('with Penguins', {type: 'PLAYING'});

};