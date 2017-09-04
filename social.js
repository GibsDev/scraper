const scrape = require('./scrape');
const cheerio = require('cheerio');

var mod = {};

mod.getTwitterFollowers = function(url){
	return new Promise(async (resolve, reject) => {
		var html;
		try {
			html = await scrape(url);
		} catch (err) {
			reject(err);
			return;
		}
		var $ = cheerio.load(html);
		var followers = $('li.ProfileNav-item--followers span.ProfileNav-value').first().text().toLowerCase().replace(',', '');
		var mult = 1;
		if(followers.endsWith('K')){
			mult = 1000;
		} else if(followers.endsWith('M')){
			mult = 1000000000;
		}
		resolve(parseInt(followers) * mult);
	});
};

mod.getYoutubeSubscribers = function(url){
	return new Promise(async (resolve, reject) => {
		var html;
		try {
			html = await scrape(url);
		} catch (err) {
			reject(err);
			return;
		}
		var $ = cheerio.load(html);
		var empty = $('div.channel-empty-message');
		var alert = $('div.yt-alert-icon');
		if(empty.length || alert.length){
			reject(Error('Invalid YouTube link: ' + url));
			return;
		}
		var subscribers = $('#subscriber-count').first().text().replace(',', '');
		resolve(parseInt(subscribers));
	});
};

mod.getTwitchFollowers = function(url) {
	return new Promise(async (resolve, reject) => {
		var html;
		try {
			html = await scrape(url);
		} catch (err) {
			reject(err);
			return;
		}
		var $ = cheerio.load(html);
		var followers = $('a.js-cn-tabs__followers span.cn-tabs__count').first().text().trim();
		resolve(parseInt(followers));
	});
};

module.exports = mod;