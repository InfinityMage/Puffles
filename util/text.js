module.exports = {

    capitalizeFirst: (content) => {
        var words = content.split(' ');
        words.forEach(w => w = w.charAt(0).toUpperCase() + w.slice(1));
        return words.join(' ');
    },

    renderEmoji: (em, client) => {
        if(!isNaN(em) && em.length === 18) return client.emojis.cache.get(em);
        else return em;
    }

}