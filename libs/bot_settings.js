var fs = require('fs');

module.exports.botSettings = botSettings;
module.exports.addchannel = addchannel;
module.exports.deletechannel = deletechannel;

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function botSettings(req, res) {
    var inComSites = JSON.parse(fs.readFileSync('./libs/sites-id/in-com.json', 'utf8'));
    var indiaTimes = JSON.parse(fs.readFileSync('./libs/sites-id/indiatimes-com.json', 'utf8'));
    var tvBurrpSites = JSON.parse(fs.readFileSync('./libs/sites-id/tv-burrp-com.json', 'utf8'));
    //console.log(inComSites)
    res.render(
        'bots', {
            title: 'Bots',
            is_login: true,
            login: req.session.login,
            in_com: inComSites,
            indiatimes_com: indiaTimes,
            tv_burrp_com: tvBurrpSites
        }
    )
}

function addchannel(req, res, bot) {
    var channel = req.params.channel;
    var channelId = req.params.id.replaceAll(' ', '%20');

    console.log('Chanel: ', channel);
    console.log('Channel id: ', channelId);

    if (channel == 'in-com') {
        var inComSites = JSON.parse(fs.readFileSync('./libs/sites-id/in-com.json', 'utf8'));

        for (var i = 0; i < inComSites.channels.length; i++) {
            if (inComSites.channels[i][0] == channelId) {
                inComSites.channels[i][2] = 'enabled';
                console.log(inComSites.channels[i]);
            }
        }

        inComSites = JSON.stringify(inComSites);
        fs.writeFileSync('./libs/sites-id/in-com.json', inComSites, 'utf-8');
        res.redirect('/bots');
    } else if (channel == 'indiatimes-com') {
        var indiaTimesSites = JSON.parse(fs.readFileSync('./libs/sites-id/indiatimes-com.json', 'utf8'));

        for (var i = 0; i < indiaTimesSites.channels.length; i++) {
            if (indiaTimesSites.channels[i][0] == channelId) {
                indiaTimesSites.channels[i][2] = 'enabled';
                console.log(indiaTimesSites.channels[i]);
            }
        }

        indiaTimesSites = JSON.stringify(indiaTimesSites);

        fs.writeFileSync('./libs/sites-id/indiatimes-com.json', indiaTimesSites, 'utf-8');
        res.redirect('/bots');
    } else if (channel == 'tv-burrp-com') {
        channelId = channelId.replace('--', '/');
        console.log('tv_burrp_com id: ', channelId);
        var tvBurrpCom = JSON.parse(fs.readFileSync('./libs/sites-id/tv-burrp-com.json', 'utf8'));

        for (var i = 0; i < tvBurrpCom.channels.length; i++) {
            if (tvBurrpCom.channels[i][0] == channelId) {
                tvBurrpCom.channels[i][2] = 'enabled';
                console.log(tvBurrpCom.channels[i]);
            }
        }

        tvBurrpCom = JSON.stringify(tvBurrpCom);

        fs.writeFileSync('./libs/sites-id/tv-burrp-com.json', tvBurrpCom, 'utf-8');
        res.redirect('/bots');
    } else {
        res.redirect('/bots');
    }
}

function deletechannel(req, res, bot) {
    var channel = req.params.channel
    var channelId = req.params.id.replaceAll(' ', '%20');

    console.log('Chanel: ', channel);
    console.log('Channel id: ', channelId);

    if (channel == 'in-com') {
         var inComSites = JSON.parse(fs.readFileSync('./libs/sites-id/in-com.json', 'utf8'));

         for (var i = 0; i < inComSites.channels.length; i++) {
            if (inComSites.channels[i][0] == channelId) {
                inComSites.channels[i][2] = 'disabled';
                console.log(inComSites.channels[i]);
            }
        }

        inComSites = JSON.stringify(inComSites);
        fs.writeFileSync('./libs/sites-id/in-com.json', inComSites, 'utf-8');
        res.redirect('/bots');
    } else if (channel == 'indiatimes-com') {
        console.log('Delete indiatimes channel');
        var indiaTimesSites = JSON.parse(fs.readFileSync('./libs/sites-id/indiatimes-com.json', 'utf8'));

        for (var i = 0; i < indiaTimesSites.channels.length; i++) {
            if (indiaTimesSites.channels[i][0] == channelId) {
                indiaTimesSites.channels[i][2] = 'disabled';
                console.log(indiaTimesSites.channels[i]);
            }
        }

        indiaTimesSites = JSON.stringify(indiaTimesSites);
        fs.writeFileSync('./libs/sites-id/indiatimes-com.json', indiaTimesSites, 'utf-8');
        res.redirect('/bots');
    } else if (channel == 'tv-burrp-com') {
        console.log('Delete tv-burrp-com');
        channelId = channelId.replace('--', '/');
        console.log('tv_burrp_com id: ', channelId);
        var tvBurrpCom = JSON.parse(fs.readFileSync('./libs/sites-id/tv-burrp-com.json', 'utf8'));

        for (var i = 0; i < tvBurrpCom.channels.length; i++) {
            if (tvBurrpCom.channels[i][0] == channelId) {
                tvBurrpCom.channels[i][2] = 'disabled';
                console.log(tvBurrpCom.channels[i]);
            }
        }

        tvBurrpCom = JSON.stringify(tvBurrpCom);
        fs.writeFileSync('./libs/sites-id/tv-burrp-com.json', tvBurrpCom, 'utf-8');
        res.redirect('/bots');
    } else {
        console.log('No channels')
        res.redirect('/bots');
    }
}