var fs = require('fs');
var http = require('http');
var moment = require('moment');

module.exports.download = download;
module.exports.checkDirectory = checkDirectory;
module.exports.ConvertTime = ConvertTime;
module.exports.getDateAndTime = getDateAndTime;
module.exports.getHumanDateAndTime = getHumanDateAndTime;
module.exports.getTomorrow = getTomorrow;
module.exports.hhmmssToSec = hhmmssToSec;

function download(url, callback) {
    http.get(url, function (res) {
        var data = '';
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function () {
            callback(data);
        });
    }).on('error', function () {
        callback(null);
    });
}

function checkDirectory(directory, callback) {
    fs.stat(directory, function (err, stats) {
        //Check if error defined and the error code is "not exists"
        if (err) {
            //Create the directory, call the callback.
            fs.mkdir(directory, callback);
        } else {
            //just in case there was a different error:
            callback(err)
        }
    });
}

function ConvertTime(time) {
    var inputval = time;

    var tokens = /([10]?\d):([0-5]\d) ([ap]m)/i.exec(inputval);
    if (tokens == null) {
        return null;
    }
    if (tokens[3].toLowerCase() === 'pm' && tokens[1] !== '12') {
        tokens[1] = '' + (12 + (+tokens[1]));
    } else if (tokens[3].toLowerCase() === 'am' && tokens[1] === '12') {
        tokens[1] = '00';
    }
    var convertedval = tokens[1] + ':' + tokens[2];

    //return convertedval;

    return moment.duration(convertedval, "HH:mm").asSeconds();
}

function getDateAndTime() {
    var currentdate = new Date();

    var seconds;
    var minutes;
    var hours;

    var year;
    var month = (currentdate.getMonth() + 1).toString();
    var day = currentdate.getDate().toString();

    if (month.length == 1) {
        month = '0' + month;
    }

    if (day.length == 1) {
        day = '0' + day;
    }

    if (currentdate.getSeconds().toString().length == 1) {
        seconds = '0' + currentdate.getSeconds();
    } else {
        seconds = currentdate.getSeconds();
    }

    if (currentdate.getMinutes().toString().length == 1) {
        minutes = '0' + currentdate.getMinutes();
    } else {
        minutes = currentdate.getMinutes();
    }

    if (currentdate.getHours().toString().length == 1) {
        hours = '0' + currentdate.getHours();
    } else {
        hours = currentdate.getHours();
    }
    var datetime = currentdate.getFullYear().toString() + month + day;

    return datetime;
}

//
// for tatsky
//
function hhmmssToSec(time) {
    var hms = time; // your input string
    var a = hms.split(':'); // split it at the colons

    // minutes are worth 60 seconds. Hours are worth 60 minutes.
    var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);

    return seconds;
}

function getTomorrow(today) {
    var tomorrow = moment(today).add(1, 'days').format('l').toString().split('/');

    var year = tomorrow[2];
    var month = tomorrow[0];

    if (month.length == 1) {
        month = '0' + month;
    }

    var day = tomorrow[1];

    if (day.length == 1) {
        day = '0' + day;
    }


    tomorrow = year + month + day;

    return tomorrow;
}

function getHumanDateAndTime() {
    var currentdate = new Date();

    var seconds;
    var minutes;
    var hours;
    if (currentdate.getSeconds().toString().length == 1) {
        seconds = '0' + currentdate.getSeconds();
    } else {
        seconds = currentdate.getSeconds();
    }

    if (currentdate.getMinutes().toString().length == 1) {
        minutes = '0' + currentdate.getMinutes();
    } else {
        minutes = currentdate.getMinutes();
    }

    if (currentdate.getHours().toString().length == 1) {
        hours = '0' + currentdate.getHours();
    } else {
        hours = currentdate.getHours();
    }
    var datetime = currentdate.getDate() + "/" +
        (currentdate.getMonth() + 1) + "/" +
        currentdate.getFullYear() + " @ " +
        hours + ":" +
        minutes + ":" +
        seconds;

    return datetime;
}