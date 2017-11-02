var downloads = require('./scrapchannels');
var channelsJs = require('./sites-id/indiatimes-com.json');
var helpers = require('./helpers');
var fs = require('fs');

var allChannels = channelsJs.channels.slice(0);

var count = 0;

var pathToLog = '../public/logs/indiatimes-com.txt';

function download(channels, again) {
    var date = helpers.getDateAndTime();
    if (channels.length != 0) {
        if (again == true) {
            console.log('Creating new log file')
            fs.writeFileSync('../public/logs/indiatimes-com.txt', 'Bot started: ' + helpers.getHumanDateAndTime() + '\n');
        }
        count++;

        var currentChannel = channels.shift();
        var currentChannelId = currentChannel[0];
        var currentChannelName = currentChannel[1];
        if (currentChannel[2] == 'enabled') {
            var date = helpers.getDateAndTime();

            console.log('==============================================================');
            console.log('==============================================================');
            console.log('==============================================================');
            console.log(count);
            console.log('Date to download: ', helpers.getHumanDateAndTime());

            console.log('Current channel: ' + currentChannelId + '-' + currentChannelName);

            console.log('Date to download: ', date);

            console.log('Current channel: ' + currentChannelId + '-' + currentChannelName);

            //
            // LOGS
            //
            fs.appendFileSync(pathToLog, helpers.getHumanDateAndTime() + ' - Current channel: ' + currentChannelName + '; Date to download: ' + helpers.getDateAndTime() + '\n');
            //
            // LOGS
            //

            downloads.downloadIndiatimesCom('indiatimes.com', currentChannelName, currentChannelId, date);
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
            download(channelsJs.channels.slice(0), true);
        }, 43200000);
    }

}

function downloadAgain(currentChannelId, currentChannelName, date, channels) {
    var currentChannelId = currentChannelId;
    var currentChannelName = currentChannelName;
    var date = helpers.getTomorrow(date);

    console.log('Date to download: ', date);
    console.log('Current channel: ' + currentChannelId + '-' + currentChannelName);

    //
    // LOGS
    //
    fs.appendFileSync(pathToLog, helpers.getHumanDateAndTime() + ' - Current channel: ' + currentChannelName + '; Date to download: ' + date + '\n');
    //
    // LOGS
    //

    downloads.downloadIndiatimesCom('indiatimes.com', currentChannelName, currentChannelId, date);
    if (downloads.getProgramExist() == true) {
        downloadAgain(currentChannelId, currentChannelName, date)
    }
}

download(allChannels, true);