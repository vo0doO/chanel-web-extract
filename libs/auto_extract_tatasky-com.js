var helpers = require('./helpers');
var fs = require('fs');
var request = require('sync-request');


function start(channels) {
    if (channels == undefined) {
        var sitesRaw = fs.readFileSync('../sitesList/tatasky-com.txt').toString();
        sitesRaw = sitesRaw.split('\n');

        var channels = [];

        for (var i = 0; i < sitesRaw.length; i++) {
            var currentChannel = sitesRaw[i].split(' - ');

            channels.push({
                channelId: currentChannel[0],
                channelName: currentChannel[1]
            });
        }

        start(channels);
    } else {
        if (channels.length != 0) {
            var currentChannel = channels.shift();

            var dateArr = helpers.getHumanDateAndTime();
            var channelId = currentChannel.channelId;
            var channelName = currentChannel.channelName;

            dateArr = dateArr.split(' ');
            dateArr = dateArr[0];
            dateArr = dateArr.split('/');

            for (var i = 0; i < dateArr.length; i++) {
                if (dateArr[i].length == 1) {
                    dateArr[i] = '0' + dateArr[i];
                }
            }

            var newDate = dateArr[2] + dateArr[1] + dateArr[0];
            var dateForSave = dateArr[2] + '-' + dateArr[1] + '-' + dateArr[0];

            getTataskyProgram(channelId, channelName, newDate, dateForSave, channels);
        } else {
            console.log('end');
            setTimeout(function () {
                start();
            }, 43200000);
        }
    }
}

function getTataskyProgram(channelId, channelName, newDate, dateForSave, channels) {
    console.log(channelName);
    console.log(channelId);
    console.log(newDate);
    var xxx = 'DD National';

    var url = 'http://tatasky.com/tvguiderv/readfiles.jsp?fileName=' + newDate + '/00' + channelId + '_event.json';
    console.log(url);

    var resp = request('GET', url);
    var data = resp.getBody().toString();

    if (!data.includes('cid')) {
        console.log('nothing');
        start(channels);
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

        if (!fs.existsSync('../public/!output/tatasky.com/')) {
            fs.mkdirSync('../public/!output/tatasky.com/');
        }

        if (!fs.existsSync('../public/!output/tatasky.com/' + channelName.trim() + '/')) {
            fs.mkdirSync('../public/!output/tatasky.com/' + channelName.trim() + '/');
        }

        if (!dateForSave.includes('-')) {
            dateForSave = [dateForSave.slice(0, 4), '-', dateForSave.slice(4)].join('');
            dateForSave = [dateForSave.slice(0, 7), '-', dateForSave.slice(7)].join('');
        }

        if (!fs.existsSync('../public/!output/tatasky.com/' + channelName.trim() + '/' + dateForSave + '/')) {
            fs.mkdirSync('../public/!output/tatasky.com/' + channelName.trim() + '/' + dateForSave + '/');
        }

        fs.writeFileSync('../public/!output/tatasky.com/' + channelName.trim() + '/' + dateForSave + '/' + dateForSave + '-' + channelName.trim() + '-program.json', JSON.stringify(programClean));

        var tomorrow = helpers.getTomorrow(newDate);

        getTataskyProgram(channelId, channelName, tomorrow, tomorrow, channels)
    }
}

start();