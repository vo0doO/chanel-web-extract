var fs = require('fs');
var request = require('sync-request');
var helpers = require('./helpers');
var config = require('../settings/index.json');

module.exports.readChannel = readChannel;
module.exports.getProgram = getProgram;

var globals = {
    sites: ['tatasky-com']
}

function readChannel(siteName, req, res) {
    console.log('LOG: readChannel(): currentSite: ', siteName)
    if (globals.sites.indexOf(siteName) > -1) {
        if (siteName == 'tatasky-com') {
            readTatasky(siteName, req, res);
        }
    } else {
        res.send('No such site');
    }

}

function readTatasky(siteName, req, res) {
    var sitesRaw = fs.readFileSync('./sitesList/tatasky-com.txt').toString();
    sitesRaw = sitesRaw.split('\n');

    var channels = [];

    for (var i = 0; i < sitesRaw.length; i++) {
        var currentChannel = sitesRaw[i].split(' - ');

        channels.push({
            channelId: currentChannel[0],
            channelName: currentChannel[1]
        });
    }

    res.render('siteNew', {
        title: siteName,
        siteName: siteName,
        is_login: true,
        login: req.session.login,
        allChannels: channels,
    });
}

function getProgram(req, res) {
    var siteName = req.body.siteName;
    var dateArr = req.body.date;
    var channelId = req.body.channels;

    if (globals.sites.indexOf(siteName) > -1) {
        if (siteName == 'tatasky-com') {
            dateArr = dateArr.split(' ');
            dateArr = dateArr[0];
            dateArr = dateArr.split('/');

            var newDate = dateArr[2] + dateArr[0] + dateArr[1];
            getTataskyProgram(siteName, channelId, newDate, req, res)
        }
    } else {
        res.send('No such site');
    }
}

function getTataskyProgram(siteName, channelId, newDate, req, res) {
    console.log(siteName);
    console.log(channelId);
    console.log(newDate);

    var url = 'http://tatasky.com/tvguiderv/readfiles.jsp?fileName=' + newDate + '/00' + channelId + '_event.json';
    console.log(url);

    var resp = request('GET', url);
    var data = resp.getBody().toString();

    if (!data.includes('cid')) {
        res.send('nothing');
    } else {
        var programRaw = JSON.parse(data);

        programRaw = programRaw.eventList;

        var programClean = [];

        for (var i = 0; i < programRaw.length; i++) {
            var nextProgramStartTime = '';

            if (programRaw[i + 1] != undefined) {
                nextProgramStartTime = helpers.hhmmssToSec(programRaw[i + 1].st)
            } else {
                nextProgramStartTime = 0;
            }
            programClean.push({
                id: programRaw[i].eid,
                name: programRaw[i].et,
                start: helpers.hhmmssToSec(programRaw[i].st),
                end: nextProgramStartTime,
                duration: programRaw[i].ed * 60
            });
        }

        console.log(programClean);
        res.send(programClean);
    }
}