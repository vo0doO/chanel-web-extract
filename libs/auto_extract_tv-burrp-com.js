var downloads = require('./scrapchannels');
var channelsJs = require('./sites-id/tv-burrp-com.json');
var helpers = require('./helpers');
var fs = require('fs');

var allChannels = channelsJs.channels.slice(0);

var count = 0;
var pathToLog = '../public/logs/tv-burrp-com.txt';

function download(channels, again) {
    if (channels.length != 0) {
        if (again == true) {
            console.log('Creating new log file')
            fs.writeFileSync('../public/logs/tv-burrp-com.txt', 'Bot started: ' + helpers.getHumanDateAndTime() + '\n');
        }
        //console.log(channelsJs.channels);

        var currentChannel = channels.shift();
        var currentChannelId = currentChannel[0];
        var currentChannelName = currentChannel[1];
        if (currentChannel[2] == 'enabled') {
            var date = helpers.getDateAndTime();

            date = [date.slice(0, 4), '-', date.slice(4)].join('');
            date = [date.slice(0, 7), '-', date.slice(7)].join('');

            console.log('Date to download: ', date);

            console.log('Current channel: ' + currentChannelId + '-' + currentChannelName);

            //
            // LOGS
            //
            fs.appendFileSync(pathToLog, helpers.getHumanDateAndTime() + ' - Current channel: ' + currentChannelName + '; Date to download: ' + helpers.getDateAndTime() + '\n');
            //
            // LOGS
            //

            downloads.downloadTvBurrpCom('tv.burrp.com', currentChannelName, currentChannelId, date);
            if (downloads.getProgramExist() == true) {
                downloadAgain(currentChannelId, currentChannelName, date, channels)
            }

            download(channels);
        } else {
            download(channels);
        }
    } else {
        console.log('end');

        //console.log('Channels on end: ', channelsJs.channels.slice(0));
        var again = true;
        setTimeout(function () {
            download(channelsJs.channels.slice(0), again);
        }, 43200000);
    }

}

function downloadAgain(currentChannelId, currentChannelName, date, channels) {
    var currentChannelId = currentChannelId;
    var currentChannelName = currentChannelName;
    var date = helpers.getTomorrow(date);

    date = [date.slice(0, 4), '-', date.slice(4)].join('');
    date = [date.slice(0, 7), '-', date.slice(7)].join('');

    console.log('Date to download: ', date);
    console.log('Current channel: ' + currentChannelId + '-' + currentChannelName);

    //
    // LOGS
    //
    fs.appendFileSync(pathToLog, helpers.getHumanDateAndTime() + ' - Current channel: ' + currentChannelName + '; Date to download: ' + date + '\n');
    //
    // LOGS
    //

    downloads.downloadTvBurrpCom('tv.burrp.com', currentChannelName, currentChannelId, date);
    if (downloads.getProgramExist() == true) {
        downloadAgain(currentChannelId, currentChannelName, date)
    }
}

download(allChannels, true);