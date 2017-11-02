/*
 * GET 
 */

//login: req.session.login, is_login: req.session.is_login
//these two parametres always msut been passed
exports.index = function (req, res) {
    if (req.session.is_login) {
        var scrapchannels = require('../libs/scrapchannels');

        var allSites = scrapchannels.getAllSites();

        res.render('index', {
            title: 'Home page',
            login: req.session.login,
            is_login: req.session.is_login,
            allSites: allSites
        });
    } else {
        var scrapchannels = require('../libs/scrapchannels');

        var allSites = scrapchannels.getAllSites();

        res.render('index', {
            title: 'Home page',
            is_login: req.session.is_login,
            allSites: allSites
        });
    }
};

exports.site = function (req, res) {
    if (req.session.is_login) {
        var scrapchannels = require('../libs/scrapchannels');
        var currSiteLink = req.params['id'];
        scrapchannels.downloadSite(currSiteLink, req, res);
    } else {
        res.redirect('/');
    }
}

exports.site2 = function (req, res) {
    /*if (req.session.is_login) {
        var scrapchannels = require('../libs/scrapchannelsNew');
        var currSiteLink = req.params['id'];
        scrapchannels.readChannel(currSiteLink, req, res);
    } else {
        res.redirect('/');
    }*/
    var scrapchannels = require('../libs/scrapchannelsNew');
    var currSiteLink = req.params['id'];
    scrapchannels.readChannel(currSiteLink, req, res);
}

exports.logout = function (req, res) {
    if (req.session.is_login) {
        req.session.destroy();
        res.redirect('/');
    } else {
        res.redirect('/');
    }
};

exports.logs_in_com = function (req, res) {
    if (req.session.is_login) {
        var logs = require('../libs/logs');
        logs.logsIn_Com(req, res);
    } else {
        res.redirect('/');
    }
};

exports.indiatimes_com = function (req, res) {
    if (req.session.is_login) {
        var logs = require('../libs/logs');
        logs.logsIndiatimes_Com(req, res);
    } else {
        res.redirect('/');
    }
};

exports.tv_burrp_com = function (req, res) {
    if (req.session.is_login) {
        var logs = require('../libs/logs');
        logs.logsTv_Burrp_Com(req, res);
    } else {
        res.redirect('/');
    }
};

exports.bots = function (req, res) {
    if (req.session.is_login) {
        var bots = require('../libs/bot_settings');
        bots.botSettings(req, res);
    } else {
        res.redirect('/');
    }

};

exports.botsettings = function (req, res) {
    if (req.session.is_login) {
        var bots = require('../libs/bot_settings');
        bots.changeChannels(req, res);
    } else {
        res.redirect('/');
    }
};

exports.addchannel = function (req, res) {
    if (req.session.is_login) {
        var bots = require('../libs/bot_settings');
        bots.addchannel(req, res);
    } else {
        res.redirect('/');
    }
};

exports.deletechannel = function (req, res) {
    if (req.session.is_login) {
        var bots = require('../libs/bot_settings');
        bots.deletechannel(req, res);
    } else {
        res.redirect('/');
    }

};

exports.info = function (req, res) {
    if (req.session.is_login) {
        var bots = require('../libs/info');
        bots.showInfo(req, res);
    } else {
        res.redirect('/');
    }

};

/*
 * POST 
 */

exports.register = function (req, res) {
    var auth = require('../libs/auth');

    auth.register(req, res);
}

exports.login = function (req, res) {
    var auth = require('../libs/auth');

    auth.login(req, res);
}

exports.getcanalprogram = function (req, res) {
    var scrapchannels = require('../libs/scrapchannels');

    scrapchannels.checkParseUse(req, res);
    //console.log(req.body);
}

exports.getcanalprogramNew = function (req, res) {
    var scrapchannels = require('../libs/scrapchannelsNew');

    scrapchannels.getProgram(req, res);
    //console.log(req.body);
}

exports.gettvprogramspost = function (req, res) {
    var scrapchannels = require('../libs/scrapchannels');

    scrapchannels.downloadSite(req, res);
}