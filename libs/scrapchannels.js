var http = require('http');
var fs = require('fs');
var config = require('../settings/index.json');
var unzip = require('unzip');
var request = require('sync-request');
var helpers = require('./helpers');

module.exports.downloadSite = downloadSite;
module.exports.getAllSites = getAllSites;
module.exports.checkParseUse = checkParseUse;
module.exports.readXML = readXML;
module.exports.downloadSiteBackground = downloadSiteBackground;
module.exports.getProgramExist = getProgramExist;

module.exports.downloadInCom = downloadInCom;
module.exports.downloadTvBurrpCom = downloadTvBurrpCom;
module.exports.downloadIndiatimesCom = downloadIndiatimesCom;

//
// Helpers
//

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

//
//
//


//
// for background
//
var programExist;

function getProgramExist() {

    return programExist;
}

function getAllSites() {
    var allSites = config.sites;

    return allSites;
}

var durationTime = [];

var sitesToDoWith = [];
var chanelsId = [];
var channelsNames = [];

function downloadSiteBackground(link, siteName, res, req) {
    var dir = '../tmp/';

    helpers.checkDirectory(dir, function (err) {
        if (err) {
            res.send('cannot create folder');
            console.log('cannot create folder');
        } else {
            //console.log('req.body: ', req.body);

            //var currSite = req.body.site;

            console.log('User chose: ', link);
            var site;

            console.log('Current site is: ', siteName);

            var filePath = dir + siteName + '.zip';
            var file = fs.createWriteStream(filePath);
            var request = http.get(link, function (response) {
                response.pipe(file);

                response.on('end', function () {
                    console.log('site donwloaded');

                    fs.createReadStream(filePath)
                        .pipe(unzip.Extract({
                            path: dir
                        }))
                        .on('close', function () {
                            if (res == undefined) {
                                readXML(dir, siteName);
                            } else {
                                readXML(dir, siteName, req, res);
                            }
                        });
                })
            });
        }
    })
}

function downloadSite(link, req, res) {
    var dir = './tmp/';

    helpers.checkDirectory(dir, function (err) {
        if (err) {
            res.send('cannot create folder');
            console.log('cannot create folder');
        } else {
            //console.log('req.body: ', req.body);

            if (req != undefined) {
                var currSite = req.body.site;
            }


            console.log('User chose: ', link);
            var site;

            //get channel in config
            for (var i = 0; i < config.sites.length; i++) {
                if (config.sites[i]['link'] == link) {
                    site = config.sites[i];
                }
            }
            //console.log(config);
            console.log('Current site is: ', site.name);

            var filePath = dir + site.name + '.zip';
            var file = fs.createWriteStream(filePath);
            var request = http.get(site.urlDownload, function (response) {
                response.pipe(file);

                response.on('end', function () {
                    console.log('site donwloaded');

                    fs.createReadStream(filePath)
                        .pipe(unzip.Extract({
                            path: dir
                        }))
                        .on('close', function () {
                            readXML(dir, site.name, req, res);
                        });
                })
            });
        }
    })
}

//readXML('../tmp/', 'indiatimes.com');

function readXML(dir, siteName, req, res) {
    var channelsId = [];
    var chanIdName = [];
    var channels;

    var channelsIdName = [];

    fs.readdir(dir, function (err, files) {
        console.log("files count :", files.length);

        console.log('Files in folder: ', files);

        for (var e in files) {
            //if (files[e].includes('.xml') == true && files[e].includes(siteName) == true) {//if (files[e].indexOf('.xml') !== -1 && files[e].indexOf(siteName) !== -1) {
                if (files[e].indexOf('.xml') > -1 && files[e].indexOf(siteName) > -1) {
                var currentSite = files[e];

                console.log('Current file: ', currentSite);
                var file = fs.readFileSync(dir + currentSite);
                console.log('Path to file: ', dir + currentSite);
                var tmpSite = [];
                tmpSite = file.toString().split('<channel update="i"');

                tmpSite.shift();

                for (var q = 0; q < tmpSite.length; q++) {
                    channelsIdName.push(
                        [
                            tmpSite[q].match(/site_id="(.*?)"/)[1],
                            tmpSite[q].match(/xmltv_id="(.*?)"/)[1]
                        ]
                    );
                }
                channelsIdName.sort();
            }

        }

        //console.log('channels :', channelsIdName);
        //
        // For background
        //
        if (res == undefined) {
            //return channelsIdName;
            fs.writeFileSync('id.json', JSON.stringify(channelsIdName));
        } else {
            res.render('site', {
                title: siteName,
                siteName: siteName,
                is_login: true,
                login: req.session.login,
                allChannels: chanIdName,
                allChannelsId: channelsId,
                channelsIdName: channelsIdName
            });
        }
    });
}

/*
 * Channels scrapers ========================================================================================
 */
function checkParseUse(req, res) {
    var currChannel = req.body.channels.split('|');

    var currSiteName = req.body.siteName;
    var currChannelId = currChannel[0];
    var currChannelName = currChannel[1];

    console.log('Start parse');

    console.log('Site name: ', currSiteName);
    console.log('Channel name: ', currChannelName)
    console.log('Site channel id: ', currChannelId);

    //choose method to parse
    if (currSiteName == 'in.com') {
        //we get date from form in such view - 21/09/2016 12:30 PM
        //we need convert it to 20160921
        var dateArr = req.body.date.split(' ');
        var date = dateArr[0];
        var newDateArr = date.split('/');
        var newDate = newDateArr[2] + newDateArr[0] + newDateArr[1];

        console.log('Date: ', newDate);
        downloadInCom(currSiteName, currChannelName, currChannelId, newDate, req, res);
    }
    if (currSiteName == 'tv.burrp.com') {
        //we get date from form in such view - 21/09/2016 12:30 PM
        //we need convert it to 20160921
        var dateArr = req.body.date.split(' ');
        var date = dateArr[0];
        var newDateArr = date.split('/');
        var newDate = newDateArr[2] + '-' + newDateArr[0] + '-' + newDateArr[1];

        console.log('Date: ', newDate);
        console.log('Site: ', currSiteName);
        downloadTvBurrpCom(currSiteName, currChannelName, currChannelId, newDate, req, res);
    }
    if (currSiteName == 'indiatimes.com') {
        //we get date from form in such view - 21/09/2016 12:30 PM
        //we need convert it to 20160921
        var dateArr = req.body.date.split(' ');
        var date = dateArr[0];
        var newDateArr = date.split('/');
        var newDate = newDateArr[2] + newDateArr[0] + newDateArr[1];

        console.log('Date: ', newDate);
        downloadIndiatimesCom(currSiteName, currChannelName, currChannelId, newDate, req, res);
    }
}

function downloadInCom(currSiteName, currChannelName, channelId, date, req, res) {
    var url = 'http://www.in.com/ajax/getChannelSchedule.php?cid=' + channelId + '&dt=' + date;
    console.log('Current channel url: ', url);

    var programTitles = [];
    var urls = [];
    var playStart = [];
    var imgsUrl = [];

    var resp = request('GET', url);
    var data = resp.getBody().toString();

    //console.log(data);
    if (data.indexOf('schedule_grid') > -1 == false) {
        console.log('data.indexOf(schedule_grid) > -1: ', data.indexOf('schedule_grid') > -1)
        console.log('Error');
        error(res, req, 'No tv program on this day');
    } else {
        var allPr = data.split('<div class="schedule_grid ">');

        //delete first element
        allPr.shift();

        console.log('Start parse ajax response to get tv program');
        for (var i = 0; i < allPr.length; i++) {

            //urls
            var tmp1 = allPr[i].match(/(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/);
            urls.push(tmp1[0].replace('"', ''));

            //program titles
            var tmp2 = allPr[i].match(/alt="(.*?)"/);
            programTitles.push(tmp2[0].replace('alt="', '').replace('"', ''));

            //play start
            var tmp3 = allPr[i].match(/<p class="info">\n(.*?)<\/p>/);
            playStart.push(tmp3[0].replace('<p class="info">\n', '').replace('        </p>', '').trim());

            //all images
            var tmp4 = allPr[i].match(/<img src="(.*?)"/);
            imgsUrl.push(tmp4[0].replace('<img src="', '').replace('"', ''));
        }

        var newArr = [];

        for (var i = 0; i < programTitles.length; i++) {
            try {
                var now = helpers.ConvertTime(playStart[i].replace('.', ':'));
                var then = helpers.ConvertTime(playStart[i + 1].replace('.', ':'));
                var duration = then - now;
                newArr.push({
                    'id': i + 1,
                    'name': programTitles[i],
                    'start': helpers.ConvertTime(playStart[i].replace('.', ':')),
                    'end': then,
                    'duration': duration,
                    'mp4': ''
                });
            } catch (e) {
                newArr.push({
                    'id': i + 1,
                    'name': programTitles[i],
                    'start': helpers.ConvertTime(playStart[i].replace('.', ':')),
                    'end': then,
                    'duration': '',
                    'mp4': ''
                });
            }

        }
        //
        // need to change format date and add to it dashs
        //
        date = [date.slice(0, 4), '-', date.slice(4)].join('');
        date = [date.slice(0, 7), '-', date.slice(7)].join('');

        //
        // if background process
        //
        try {
            if (res == undefined) {
                console.log('background');

                var folder1 = '../public/!output/' + currSiteName + '/';
                var folder2 = '../public/!output/' + currSiteName + '/' + currChannelName + '/';
                var folder3 = '../public/!output/' + currSiteName + '/' + currChannelName + '/' + date + '/';

                if (!fs.existsSync(folder1)) {
                    fs.mkdirSync(folder1);
                }
                if (!fs.existsSync(folder2)) {
                    fs.mkdirSync(folder2);
                }
                if (!fs.existsSync(folder3)) {
                    fs.mkdirSync(folder3);
                }

                var file = '../public/!output/' + currSiteName + '/' + currChannelName + '/' + date + '/' + date + '-' + currChannelName + 'TV-program.json';

                fs.writeFileSync(file, JSON.stringify(newArr));

                newArr = [];
                console.log('%s done', currSiteName);
                console.log('=============================');
                programExist = true;
                console.log('end');
                console.log('=============================');
            } else {
                helpers.checkDirectory('./public/!output/' + currSiteName, function (err) {
                    if (!err) {
                        helpers.checkDirectory('./public/!output/' + currSiteName + '/' + currChannelName, function (err2) {
                            if (!err2) {
                                helpers.checkDirectory('./public/!output/' + currSiteName + '/' + currChannelName + '/' + date, function (err3) {
                                    if (!err3) {
                                        var file = './public/!output/' + currSiteName + '/' + currChannelName + '/' + date + '/' + date + '-' + currChannelName + 'TV-program.json';

                                        fs.writeFileSync(file, JSON.stringify(newArr));

                                        newArr = [];
                                        console.log('%s done', currSiteName);

                                        res.render('result', {
                                            title: 'OK',
                                            message: '666',
                                            login: req.session.login,
                                            is_login: true,
                                            jsonUrl: file.replace('./!output/', '/!output/').replace('public', '').replace('//', '/')
                                        });

                                    } else {
                                        console.log('Create folder 3 err: ', err3);
                                    }
                                });
                            } else {
                                console.log('Create folder 2 err: ', err2);
                            }
                        });
                    } else {
                        console.log('Create folder 1 err: ', err);
                    }
                });
            }
        } catch (err) {
            console.log('err: ', err);
        }
    }
}

function downloadTvBurrpCom(currSiteName, currChannelName, channelId, date, req, res) {
    var url = config.sites[1].urlChannel.replace('{id}', channelId).replace('{date}', date);
    console.log('Current channel url: ', url);
    console.log('downloadTvBurrpCom');

    var programTitles = [];
    var urls = [];
    var playStart = [];
    var imgsUrl = [];

    var resp = request('GET', url);
    var data = resp.getBody().toString();

    var playStartTMP = data.match(/											(.*?)<\/sup>/g);
    var imgsUrlTMP = data.match(/<img src="(.*?)"\/>/g);
    var titlesAndUrlsTMP = data.match(/<a class="title" href="(.*?)">/g);

    //console.log(playStartTMP);
    if (playStartTMP == null || imgsUrlTMP == null || titlesAndUrlsTMP == null) {
        console.log('Error');
        error(res, req, 'No tv program on this day');
    } else {
        /*
         * remove first four elements that are not pics of programs
         */
        imgsUrlTMP.shift();
        imgsUrlTMP.shift();
        imgsUrlTMP.shift();
        imgsUrlTMP.shift();

        for (var i = 0; i < playStartTMP.length; i++) {
            playStart.push(playStartTMP[i].replace('\t\t\t\t\t\t\t\t\t\t\t', '').replace('<sup class="ap">', ' ').replace('</sup>', ''));
        }
        for (var i = 0; i < imgsUrlTMP.length; i++) {
            imgsUrl.push(imgsUrlTMP[i].replace('<img src="', '').replace('"/>', ''));
        }
        for (var i = 0; i < titlesAndUrlsTMP.length; i++) {
            var tmpArr = titlesAndUrlsTMP[i].split('" title="');
            programTitles.push(tmpArr[1].replace('">', ''));
            urls.push(tmpArr[0].replace('<a class="title" href="', ''));
        }

        var newArr = [];
        for (var i = 0; i < programTitles.length; i++) {
            try {
                var now = helpers.ConvertTime(playStart[i]);
                var then = helpers.ConvertTime(playStart[i + 1]);
                var duration = then - now;
                newArr.push({
                    'id': i + 1,
                    'name': programTitles[i],
                    'start': helpers.ConvertTime(playStart[i].replace('.', ':')),
                    'end': then,
                    'duration': duration,
                    'mp4': ''
                });
            } catch (e) {
                newArr.push({
                    'id': i + 1,
                    'name': programTitles[i],
                    'start': helpers.ConvertTime(playStart[i].replace('.', ':')),
                    'end': '',
                    'duration': '',
                    'mp4': ''
                });
            }

        }

        //
        // background
        //
        if (res == undefined) {
            console.log('background');

            var folder1 = '../public/!output/' + currSiteName + '/';
            var folder2 = '../public/!output/' + currSiteName + '/' + currChannelName + '/';
            var folder3 = '../public/!output/' + currSiteName + '/' + currChannelName + '/' + date + '/';

            if (!fs.existsSync(folder1)) {
                fs.mkdirSync(folder1);
            }
            if (!fs.existsSync(folder2)) {
                fs.mkdirSync(folder2);
            }
            if (!fs.existsSync(folder3)) {
                fs.mkdirSync(folder3);
            }

            var file = '../public/!output/' + currSiteName + '/' + currChannelName + '/' + date + '/' + date + '-' + currChannelName + 'TV-program.json';

            fs.writeFileSync(file, JSON.stringify(newArr));

            newArr = [];
            console.log('%s done', currSiteName);
            console.log('=============================');
            programExist = true;
            console.log('end');
            console.log('=============================');
        } else {
            helpers.checkDirectory('./public/!output/' + currSiteName, function (err) {
                if (!err) {
                    helpers.checkDirectory('./public/!output/' + currSiteName + '/' + currChannelName, function (err2) {
                        if (!err2) {
                            helpers.checkDirectory('./public/!output/' + currSiteName + '/' + currChannelName + '/' + date, function (err3) {
                                if (!err3) {
                                    var file = './public/!output/' + currSiteName + '/' + currChannelName + '/' + date + '/' + date + '-' + currChannelName + 'TV-program.json';

                                    fs.writeFileSync(file, JSON.stringify(newArr));

                                    newArr = [];
                                    console.log('%s done', currSiteName);

                                    //res.redirect('/');
                                    res.render('result', {
                                        title: 'OK',
                                        message: '666',
                                        login: req.session.login,
                                        is_login: true,
                                        jsonUrl: file.replace('./!output/', '/!output/').replace('public', '').replace('//', '/')
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    }

}

function downloadIndiatimesCom(currSiteName, currChannelName, channelId, date, req, res) {
    var url = config.sites[2].urlChannel.replace('{id}', channelId).replaceAll('{date}', date);
    console.log('Current channel url: ', url);
    console.log('downloadIndiatimesCom');

    var programTitles = [];
    var urls = [];
    var playStart = [];
    var playEnd = [];
    var imgsUrl = [];

    var resp = request('GET', url);
    var data = resp.getBody().toString();

    //console.log('zzz: ', data);

    if (data.indexOf('a href=') > -1 == false) {
        console.log('data.indexOf("a href=") == false:', data.indexOf('a href=') > -1);
        console.log('Error');
        error(res, req, 'No tv program on this day');
    } else {
        //we have html with html tags. delete all to have only tr to split
        var tmpArr = data.split('cellpadding="0">');
        tmpArr.shift();
        tmpArr = tmpArr[0].replace('</table>', '');
        tmpArr = tmpArr.split('</tr>');

        for (var i = 0; i < tmpArr.length; i++) {
            if (tmpArr[i].match(/">(.*?)<\/td>/) != null) {
                var tmpTime = tmpArr[i].match(/">(.*?)<\/td>/)[1].split('>');
                var tmpUrls = tmpArr[i].match(/<a href="(.*?)"/)[1];
                var tmpTitles = tmpArr[i].match(/">(.*?)<\/a>/)[1].split('title="')[1].split('">');
                var tmpTitles = tmpTitles[1];

                programTitles.push(tmpTitles);
                tmpTime = tmpTime.pop();
                playStart.push(tmpTime);
                urls.push('http://timesofindia.indiatimes.com' + tmpUrls);
            }
        }

        for (var i = 1; i <= playStart.length; i++) {
            if (i == playStart.length) {
                playEnd.push(null);
            } else {
                playEnd.push(playStart[i]);
            }
        }

        var newArr = [];
        for (var i = 0; i < programTitles.length; i++) {
            try {
                var now = helpers.ConvertTime(playStart[i]);
                var then = helpers.ConvertTime(playStart[i + 1]);
                var duration = then - now;
                newArr.push({
                    'id': i + 1,
                    'name': programTitles[i],
                    'start': helpers.ConvertTime(playStart[i].replace('.', ':')),
                    'end': helpers.ConvertTime(playEnd[i].replace('.', ':')),
                    'duration': duration,
                    'mp4': ''
                });
            } catch (e) {
                newArr.push({
                    'id': i + 1,
                    'name': programTitles[i],
                    'start': helpers.ConvertTime(playStart[i].replace('.', ':')),
                    'end': '',
                    'duration': '',
                    'mp4': ''
                });
            }

        }
        //
        // need to change format date and add to it dashs
        //
        date = [date.slice(0, 4), '-', date.slice(4)].join('');
        date = [date.slice(0, 7), '-', date.slice(7)].join('');

        //
        // for background
        //
        if (res == undefined) {
            console.log('background');

            var folder1 = '../public/!output/' + currSiteName + '/';
            var folder2 = '../public/!output/' + currSiteName + '/' + currChannelName + '/';
            var folder3 = '../public/!output/' + currSiteName + '/' + currChannelName + '/' + date + '/';

            if (!fs.existsSync(folder1)) {
                fs.mkdirSync(folder1);
            }
            if (!fs.existsSync(folder2)) {
                fs.mkdirSync(folder2);
            }
            if (!fs.existsSync(folder3)) {
                fs.mkdirSync(folder3);
            }

            var file = '../public/!output/' + currSiteName + '/' + currChannelName + '/' + date + '/' + date + '-' + currChannelName + 'TV-program.json';

            fs.writeFileSync(file, JSON.stringify(newArr));

            newArr = [];
            console.log('%s done', currSiteName);
            console.log('=============================');
            programExist = true;
            console.log('end');
            console.log('=============================');
        } else {
            helpers.checkDirectory('./public/!output/' + currSiteName, function (err) {
                if (!err) {
                    helpers.checkDirectory('./public/!output/' + currSiteName + '/' + currChannelName, function (err2) {
                        if (!err2) {
                            helpers.checkDirectory('./public/!output/' + currSiteName + '/' + currChannelName + '/' + date, function (err3) {
                                if (!err3) {
                                    var file = './public/!output/' + currSiteName + '/' + currChannelName + '/' + date + '/' + date + '-' + currChannelName + 'TV-program.json';

                                    fs.writeFileSync(file, JSON.stringify(newArr));

                                    newArr = [];
                                    console.log('%s done', currSiteName);

                                    //res.redirect('/');
                                    res.render('result', {
                                        title: 'OK',
                                        message: '666',
                                        login: req.session.login,
                                        is_login: true,
                                        jsonUrl: file.replace('./!output/', '/!output/').replace('public', '').replace('//', '/')
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    }
}


function getDuration(now, then) {
    var startTime = moment(now, "HH:mm");
    var endTime = moment(then, "HH:mm");
    var duration = moment.duration(endTime.diff(startTime));
    var hours = parseInt(duration.asHours());
    var minutes = parseInt(duration.asMinutes()) - hours * 60;
    return hours + ':' + minutes;
}

function error(res, req, errorText) {
    if (res == undefined) {
        console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        console.log(errorText);
        programExist = false;
        console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    } else {
        res.render('error', {
            title: 'Error',
            errorText: errorText,
            login: req.session.login,
            is_login: true
        });
    }
}