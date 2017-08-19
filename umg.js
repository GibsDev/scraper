const cheerio = require('cheerio');
const scrape = require('./scrape');
const URL = require('url');
const social = require('./social');

var mod = {};

const months = [
	'january',
	'february',
	'march',
	'april',
	'may',
	'june',
	'july',
	'august',
	'september',
	'october',
	'november',
	'december',
];

var gameImages = {
	'2eedef2994b174a58d81ddd0edca1a7a.png': 'Call of Duty: Modern Warfare',
	'893b5bf3beae503b97aa3acc30ca2cfa.png': 'Call of Duty: Infinite Warfare',
	'78c844dd952d329f80bde3f88f075ef9.png': 'Call of Duty: Black Ops 3',
	'ed642a12eacd2d54e18695e6bf364ed5.png': 'Call of Duty: Black Ops 2',
	'fc917c0164bff63740f750a820d82642.png': 'Call of Duty: Ghosts',
	'df26bcb91e2d6bf72b0251a70a19d6e3.png': 'Call of Duty: Advanced Warfare',
	'fbff0a6e8b3e72e0e79a601500c941a8.png': 'Gears of War 4',
	'bd5498289c2c0a1665413ab48a70820b.png': 'Halo 5',
	'502b8c78acaaf7e60ef33ff6d640b646.png': 'Rocket League',
	'ba736aade952f2fdcc1c4bee034a1209.png': 'FIFA 17',
	'e3edda6c8c303e66add036a28d2e5799.png': 'Rainbow Six: Siege',
	'2d8eeff4192ea7d47e15a15920b44cdb.png': 'NBA 2K17',
	'08eb564277e29298cffb6be168c1800d.png': 'Uncharted',
	'778038c955d14664af0624c49f5bcfc5.png': 'Disc Jam',
	'05f076c88bbaefea1580c9cd7bb4c3fd.png': '8 Ball Pool',
	'fabb4640ebd079c6af2abf85daa211ff.png': 'Clash Royale',
	'7f9b33f6096621aaaa3365b322c40dc4.png': 'Super Smash Bros'
};

mod.tournamentsPage = 'https://umggaming.com/tournaments';

// Verifies that the given link is full, and not just a path
function link(link){
	if(link.startsWith('/')){
		var url = URL.parse(mod.tournamentsPage);
		return mod.tournamentsPage.replace(url.pathname, link);
	}
	return link;
}

// Resolves a list of objects in the format [ { link: <link>, date: <start time> }, ... ]
mod.checkTournaments = function(){
	return new Promise(async (resolve, reject) => {
		var tournaments = [];
		var html = await scrape(mod.tournamentsPage);
		var $ = cheerio.load(html);
		var baseSelector = 'ul.games-list > li';
		$(baseSelector).each((i, elem) => {
			var t = {};
			t.link = link($(elem).find('a[href*="/tournaments/"]').attr('href'));
			var now = new Date(Date.now());
			var day = $(elem).find('p > strong').first().text().trim();
			var time = $(elem).find('p > span').first().text().trim();
			var hour12 = (time.toLowerCase().endsWith('pm')) ? 12 : 0;
			var hour = parseInt(time.split(':')[0]);
			var minute = parseInt(time.split(':')[1]);
			hour += hour12;
			var month = months.indexOf(day.split(' ')[0].toLowerCase());
			var day = parseInt(day.split(' ')[1]);
			var dateshown = new Date(now.getFullYear(), month, day, hour, minute);
			t.date = new Date(dateshown.valueOf() - (1000 * 60 * 60 * 4));
			tournaments.push(t);
		});
		resolve(tournaments);
	});
}

// Resolves a Tournament with Users documents directly stored inside of it
mod.processTournament = function(url){
	return new Promise(async (resolve, reject) => {
		var tournament = {};
		var u = URL.parse(url);
		tournament._id = url;
		tournament.website = u.hostname;
		tournament.users = [];
		// Load info page
		var html = await scrape(url);
		var $ = cheerio.load(html);
		tournament.title = $('col-cm-6 > h2').text().trim();
		tournament.region = getRegion($);
		tournament.platform = getPlatform($);
		tournament.game = getGameTitle($);
		var dateshown = getDate($);
		tournament.date = new Date(dateshown.valueOf() - (1000 * 60 * 60 * 4));
		tournament.entry = parseInt($('div.container div.row div.row ul:nth-child(1) li:nth-child(1) p span').text().replace('  ', ' '));
		tournament.teamSize = parseInt($('div.col-sm-10 > div.row > ul:nth-child(3) > li:nth-child(2) span').first().text());
		// Load team page
		html = await scrape(url + '/teams');
		$ = cheerio.load(html);
		var teamLinkSelector = $('table#leaderboard-table tbody a');
		var teamLinkElems = teamLinkSelector.toArray();
		if(!teamLinkElems.length){
			tournament.teamCount = 0;
			resolve(tournament);
			return;
		}
		tournament.teamCount = teamLinkElems.length;
		// Process each team link
		var teamLinks = [];
		teamLinkSelector.each((i, elem) => {
			var l = link($(elem).attr('href'));
			teamLinks.push(l);
		});
		var promises = [];
		for(teamLink of teamLinks){
			promises.push(processTeam(link(teamLink), url, tournament.region, tournament.game));
		}
		Promise.all(promises).then(users => {
			for(userList of users){
				for(user of userList){
					tournament.users.push(user);
				}
			}
			resolve(tournament);
		});
	});
};

// Resolves a list of Users for the given team url
function processTeam(url, tournamenturl, region, game){
	return new Promise(async (resolve, reject) => {
		var u = URL.parse(url);
		var html = await scrape(url);
		var $ = cheerio.load(html);
		var users = [];
		var userLinks = [];
		$('div.table-responsive tbody tr td a.strong').each((i, elem) => {
			userLinks.push($(elem).attr('href').trim());
		});
		var promises = [];
		for(userLink of userLinks){
			promises.push(processUser(link(userLink), tournamenturl, region, game));
		}
		Promise.all(promises).then(users => {
			resolve(users);
		});
	});
}

// Returns a promise of a User from a url
function processUser(url, tournamenturl, region, game){
	return new Promise(async (resolve, reject) => {
		var u = URL.parse(url);
		var user = {};
		user._id = url;
		user.website = u.hostname;
		var html = await scrape(url);
		var $ = cheerio.load(html);
		user.username = $('div.col-sm-6 > h2').first().text().trim();
		user.region = region;
		user.tournaments = [tournamenturl];
		user.games = [game];
		var e = $('div.col-sm-6 > ul:nth-child(3) li');
		if(e.length){ 
			e.each((i, elem) => {
				if($(elem).html().trim().toLowerCase().includes('ps4')){
					user.psn = $(elem).text().trim();
				} else if($(elem).html().trim().toLowerCase().includes('xbox')){
					user.xbl = $(elem).text().trim();
				}
			});
		}
		e = $('div.col-sm-6 > ul:nth-child(2) a[href*="twitter.com"]');
		if(e.length){
			user.twitter = e.attr('href');
			try {
				user.twitterFollowers = await social.getTwitterFollowers(user.twitter);
			} catch (err) {
				delete user.twitter;
				//console.log(err);
			}
		}
		e = $('div.col-sm-6 > ul:nth-child(2) a[href*="twitch.tv"]');
		if(e.length){
			user.twitch = e.attr('href');
			try {
				user.twitchFollowers = await social.getTwitchFollowers(user.twitch);
			} catch (err) {
				delete user.twitch;
				//console.log(err);
			}
		}
		e = $('div.col-sm-6 > ul:nth-child(2) a[href*="youtube.com"]');
		if(e.length){
			user.youtube = e.attr('href');
			try {
				user.youtubeSubscribers = await social.getYoutubeSubscribers(user.youtube);
			} catch (err) {
				delete user.youtube;
				//console.log(err);
			}
		}
		resolve(user);
	});
}

function getRegion($){
	var e = $('div.col-sm-6 > ul > li');
	if(e.length){
		if(e.html().toLowerCase().includes('usa')){
			return 'NA';
		} else if(e.html().toLowerCase().includes('europe')){
			return 'EU';
		}
	}
	return 'Global';
}

function getPlatform($){
	var stuff = $('div.col-sm-12').html().toLowerCase();
	if(stuff.includes('xbox')){
		return 'Xbox One';
	} else if(stuff.includes('ps4')){
		return 'PlayStation 4';
	} else if(stuff.includes('pc')){
		return 'PC';
	} else if(stuff.includes('mobile')){
		return 'Mobile';
	}
	return 'Unknown';
}

function getGameTitle($){
	var thing = $('div.tournament-image > div').attr('style');
	for(key in gameImages) {
		if(thing.includes(key)){
			return gameImages[key];
		}
	}
	return 'Unknown';
}

function getDate($){
	var element = $('div.container div.row div.row ul:nth-child(2) li:nth-child(2) p span').first();
	var date = null;
	if(element){
		var text = element.text();
		var d = text.match(/\d+/g);
		var month = parseInt(d[0] - 1);
		var day = parseInt(d[1]);
		var year = parseInt(d[2]) + 2000;
		var hour = parseInt(d[3]);
		var minute = parseInt(d[4]);
		if(text.toLowerCase().includes('pm')){
			hour += 12;
		}
		date = new Date(year, month, day, hour, minute);
	}
	return date;
}

module.exports = mod;