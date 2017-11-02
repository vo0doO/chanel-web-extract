var fs = require('fs');
var helpers = require('./helpers')

module.exports.logsIn_Com = logsIn_Com;
module.exports.logsIndiatimes_Com = logsIndiatimes_Com;
module.exports.logsTv_Burrp_Com = logsTv_Burrp_Com;

function logsIn_Com(req, res) {
    var logs = fs.readFileSync('./public/logs/in-com.txt').toString().split('\n');
    console.log(logs)
    res.render('logs', {
        title: 'Logs',
        is_login: true,
        login: req.session.login,
        logs: logs,
        siteName: 'in.com'
    });
}

function logsIndiatimes_Com(req, res) {
    var logs = fs.readFileSync('./public/logs/indiatimes-com.txt').toString().split('\n');
    console.log(logs)
    res.render('logs', {
        title: 'Logs',
        is_login: true,
        login: req.session.login,
        logs: logs,
        siteName: 'Indiatimes.com'
    });
}

function logsTv_Burrp_Com(req, res) {
    var logs = fs.readFileSync('./public/logs/tv-burrp-com.txt').toString().split('\n');
    console.log(logs)
    res.render('logs', {
        title: 'Logs',
        is_login: true,
        login: req.session.login,
        logs: logs,
        siteName: 'tv.burrp.com'
    });
}