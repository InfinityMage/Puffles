module.exports = {

    capitalizeFirst: (content) => {
        var words = content.split(' ');
        words.forEach(w => w = w.charAt(0).toUpperCase() + w.slice(1));
        return words.join(' ');
    }

}