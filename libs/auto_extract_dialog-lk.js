var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var zlib = require('zlib');
var helpers = require('./helpers');
var moment = require('moment');



function start() {
	getListOfChannels()
		.then((result) => {
			var channels = result.Channels;
			/*var channels = [{
				id: 1,
				ChannelId: 'CID-sku2940712',
				ChannelName: 'udhayam-tv'
			}, {
				id: 11,
				ChannelId: 'CID-sku1500225',
				ChannelName: 'amc'
			}]*/
			var cookie = result.Cookie[1] + ';' + result.Cookie[0];

			console.log(channels);
			// /getDateAndTime()  '2017-04-15'
			return getPrograms(channels, getDateAndTime())
				.then(() => {
					console.log('end');

					setTimeout(function () {
						start();
					}, 43200000);
				});
		})

}

function parseFile(file, channelName, date) {
	if (file.includes('class="programme-popup"')) {
		var $ = cheerio.load(file);

		var program = $('a.programme-popup');
		//
		//$(program)[0].children[3].attribs - channelSkuId
		//$(program)[0].children[5].attribs - programmeName
		//$(program)[0].children[7].attribs - startTime
		//$(program)[0].children[9].attribs - description
		//$(program)[0].children[11].attribs - duration

		var jsonFile = [];
		for (var i = 0; i < $(program).length; i++) {
			var startTime = $(program)[i].children[7].attribs.value.split(', ').pop();
			var duration = $(program)[i].children[11].attribs.value;

			duration = helpers.ConvertTime(duration + ' AM');
			startTime = helpers.ConvertTime(startTime);
			var endTime = '';

			if (i != $(program).length - 1) {
				endTime = $(program)[i + 1].children[7].attribs.value.split(', ').pop();
				endTime = helpers.ConvertTime(endTime);
			} else {
				endTime = '';
			}
			//console.log($(program)[i].children[5].attribs)
			jsonFile.push({
				id: i + 1,
				name: $(program)[i].children[5].attribs.value,
				start: startTime,
				end: endTime,
				duration: duration,
				mp4: ''
			});
		}

		if (!fs.existsSync('../public/!output/dialog.lk/')) {
			fs.mkdirSync('../public/!output/dialog.lk/');
		}

		if (!fs.existsSync('../public/!output/dialog.lk/' + channelName + '/')) {
			fs.mkdirSync('../public/!output/dialog.lk/' + channelName + '/');
		}

		if (!fs.existsSync('../public/!output/dialog.lk/' + channelName + '/' + date + '/')) {
			fs.mkdirSync('../public/!output/dialog.lk/' + channelName + '/' + date + '/');
		}

		if (!fs.existsSync('../public/!output/dialog.lk/' + channelName + '/' + date + '/')) {
			fs.mkdirSync('../public/!output/dialog.lk/' + channelName + '/' + date + '/');
		}


		fs.writeFileSync('../public/!output/dialog.lk/' + channelName + '/' + date + '/' + date + '-' + channelName + '-program.json', JSON.stringify(jsonFile));

		return true;
	} else {
		console.log('no programs');

		return false;
	}
}

function getListOfChannels() {
	return new Promise((resolve, reject) => {
		var headers = {
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
		}

		var options = {
			url: 'https://www.dialog.lk/browse/tvProgrammeGuide.jsp?categoryId=onlinecat3440067',
			headers: headers,
			method: 'GET',
		}

		request(options, function (error, response, body) {
			if (error) {
				console.log(error);

				setTimeout(() => {
					getListOfChannels();
				}, 60000);
			} else {
				var set_cookie = response.headers['set-cookie'];
				var cookie = '';

				for (var i = 0; i < set_cookie.length; i++) {
					cookie += set_cookie[i];
				}

				if (body.includes('div id="tv-programme"')) {
					var $ = cheerio.load(body);
					var channel = $('#tv-programme #channels ul li');

					var channels = [];

					for (var i = 0; i < channel.length; i++) {
						//console.log($(channel)[i].children[1]);
						var channelName = channel[i].children[1].attribs.href.toLowerCase().split('/television-channel-').pop().replace('/', '');
						channels.push({
							id: i + 1,
							ChannelId: channel[i].attribs.id,
							ChannelName: channelName
						});
					}

					return resolve({
						Cookie: set_cookie,
						Channels: channels
					});
				} else {
					setTimeout(() => {
						getListOfChannels();
					}, 60000);
				}
			}

		});
	});
}

function getPrograms(channels, date) {
	return new Promise((resolve, reject) => {
		getProgramsInside(channels, date);


		function getProgramsInside(channels, date, channelNameAgain, numberAgain, again) {
			if (channels.length != 0) {
				getCookie()
					.then((cookie) => {
						if (again == true) {
							var channelName = channelNameAgain;
							var number = numberAgain;
						} else {
							var channelName = channels[0].ChannelName;
							var number = channels[0].id;
						}


						console.log('Cookie: ', cookie);
						console.log('Channel name: ', channelName);
						console.log('Number: ', number);
						console.log('Date: ', date);

						var headers = {
							Accept: 'text/html, */*; q=0.01',
							'Accept-Encoding': 'gzip, deflate, br',
							'Accept-Language': 'en-GB,en;q=0.8,en-US;q=0.6,ru;q=0.4,uk;q=0.2',
							Connection: 'keep-alive',
							'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
							Cookie: cookie,
							Host: 'www.dialog.lk',
							Origin: 'https://www.dialog.lk',
							Referer: 'https://www.dialog.lk/browse/tvProgrammeGuide.jsp?categoryId=onlinecat3440067',
							'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36',
							'X-Requested-With': 'XMLHttpRequest'
						}

						var options = {
							url: 'https://www.dialog.lk/dlg/browse/gadgets/tvProgrammeGuide/showAllChannelProgrammes.jsp?atg.multisite.remap=false',
							headers: headers,
							encoding: null, // it is very import!!.
							method: 'POST',
							form: {
								howMany: '1',
								start: number,
								date: date
							}
						}

						request(options, function (error, response, body) {

							if (error) {
								console.log(error);

								getProgramsInside(channels, date);
							} else {
								console.log(response.statusCode)

								zlib.unzip(body, (err, buffer) => {
									if (err) {
										console.log(err);

										getProgramsInside(channels, date);
									} else {
										var newBody = buffer.toString();

										if (newBody.length == 0) {
											console.log('Empty');

											getProgramsInside(channels, date);
										} else {
											//console.log(newBody);
											//fs.writeFileSync('./tmp/' + channelName + '.html', newBody);


											if (parseFile(newBody, channelName, date)) {
												var tomorrowDate = getTomorrow(date);
												getProgramsInside(channels, tomorrowDate, channelName, number, true);
											} else {
												channels.shift();
												getProgramsInside(channels, getDateAndTime());
											}
										}
									}
								})
							}
						})
					})
			} else {
				return resolve();
			}
		}
	});
}

function getCookie() {
	return new Promise((resolve, reject) => {
		var headers = {
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
		}

		var options = {
			url: 'https://www.dialog.lk/browse/tvProgrammeGuide.jsp?categoryId=onlinecat3440067',
			headers: headers,
			method: 'GET',
		}

		request(options, function (error, response, body) {
			if (error) {
				console.log(error);

				setTimeout(() => {
					getCookie();
				}, 60000);
			} else {
				var set_cookie = response.headers['set-cookie'];
				var cookie = set_cookie[1] + set_cookie[0];

				if (body.includes('div id="tv-programme"')) {
					return resolve(cookie);
				} else {
					setTimeout(() => {
						getCookie();
					}, 60000);
				}
			}

		});
	});
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


	tomorrow = year + '-' + month + '-' + day;

	return tomorrow;
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
	var datetime = currentdate.getFullYear().toString() + '-' + month + '-' + day;

	return datetime;
}

function getProgramsTest(number, date, channelName) {
	getCookie()
		.then((cookie) => {
			var headers = {
				Accept: 'text/html, */*; q=0.01',
				'Accept-Encoding': 'gzip, deflate, br',
				'Accept-Language': 'en-GB,en;q=0.8,en-US;q=0.6,ru;q=0.4,uk;q=0.2',
				Connection: 'keep-alive',
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
				Cookie: cookie,
				Host: 'www.dialog.lk',
				Origin: 'https://www.dialog.lk',
				Referer: 'https://www.dialog.lk/browse/tvProgrammeGuide.jsp?categoryId=onlinecat3440067',
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36',
				'X-Requested-With': 'XMLHttpRequest'
			}

			var options = {
				url: 'https://www.dialog.lk/dlg/browse/gadgets/tvProgrammeGuide/showAllChannelProgrammes.jsp?atg.multisite.remap=false',
				headers: headers,
				encoding: null, // it is very import!!.
				method: 'POST',
				form: {
					howMany: '1',
					start: number,
					date: date
				}
			}

			request(options, function (error, response, body) {

				if (error) {
					console.log(error);

					getProgramsTest(number, date, channelName);
				} else {
					console.log(response.statusCode)

					zlib.unzip(body, (err, buffer) => {
						if (err) {
							console.log(err);

							getProgramsTest(number, date, channelName);
						} else {
							var newBody = buffer.toString();

							if (newBody.length == 0) {
								console.log('Empty');

								getProgramsTest(number, date, channelName);
							} else {
								//console.log(newBody);
								fs.writeFileSync('./tmp/' + channelName + '.html', newBody);

								console.log('end');
							}
						}
					})
				}
			})
		});
}

//getProgramsTest('11', '2017-04-13', 'cellestial-classic-movies');
start();