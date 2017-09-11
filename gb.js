const cheerio = require('cheerio');
const scrape = require('./scrape');
const URL = require('url');
const social = require('./social');

var mod = {};

mod.tournamentsPage = 'http://gamebattles.majorleaguegaming.com/tournaments';

// Resolves a list of objects in the format [ { link: <link>, date: <start time> }, ... ]
mod.checkTournaments = function(){
	return new Promise(async (resolve, reject) => {
		var tournaments = [];
		var html = await scrape(mod.tournamentsPage);
		var $ = cheerio.load(html);
		$('ul.std-list-panel > li > div').each((i, elem) => {
			var t = {};
			t.link = $(elem).find('a').attr('href');
			var now = new Date(Date.now());
			t.date = new Date($(elem).find('strong').eq(1).text());
			t.date.setFullYear(now.getFullYear());
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
		var html = await scrape(url + '/info');
		var $ = cheerio.load(html);
		tournament.title = $('div.boxContent > div.lt h2').text().trim();
		tournament.region = getRegion($);
		tournament.platform = getPlatform(url);
		tournament.game = $('div.boxContent > div.smpad > ul.rules:last-child > p').first().text().substring(18).split(' on ')[0];
		tournament.date = new Date($('div.boxContent > div.smpad > ul.rules:nth-child(4) strong').first().text()).toISOString();
		tournament.entry = $('#subcontainer > div.boxOuter.xl.lt > div.boxContent > div > ul:nth-child(8) > p:nth-child(6) > a').first().text().trim();
		tournament.teamSize = parseInt($('div.boxContent > div.smpad > ul.rules:nth-child(6) strong').eq(2).text());
		if(isNaN(tournament.teamSize)){
			tournament.teamSize = 1;
		}
		// Load team page
		html = await scrape(url + '/teams');
		$ = cheerio.load(html);
		var teamLinkSelector = $('div#StatsPanel tbody a');
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
			var link = url.replace(u.path, $(elem).attr('href'));
			teamLinks.push(link);
		});
		var promises = [];
		for(teamLink of teamLinks){
			promises.push(processTeam(teamLink, url, tournament.region, tournament.game));
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
		$('div.boxOuter.full.lt tbody tr td:first-child a').each((i, elem) => {
			userLinks.push($(elem).attr('href').trim());
		});
		var promises = [];
		for(userLink of userLinks){
			promises.push(processUser(userLink, tournamenturl, region, game));
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
		user.username = $('div.mlg-profile-headline a').first().text();
		user.region = region;
		user.tournaments = [tournamenturl];
		user.games = [game];
		var e = $('div.mlg-profile-gamertags > a');
		if(e.length){ 
			e.each((i, elem) => {
				if($(elem).attr('network-name').toLowerCase().includes('playstation')){
					user.psn = $(elem).attr('gamer-tag');
				}
				if($(elem).attr('network-name').toLowerCase().includes('xbox')){
					user.xbl = $(elem).attr('gamer-tag');
				}
			});
		}
		e = $('div.mlg-networks > span[network-url*="twitter.com"]');
		if(e.length){
			user.twitter = e.attr('network-url');
			try {
				user.twitterFollowers = await social.getTwitterFollowers(user.twitter);
			} catch (err) {
				delete user.twitter;
				//console.log(err);
			}
		}
		e = $('div.mlg-networks > span[network-url*="twitch.tv"]');
		if(e.length){
			user.twitch = e.attr('network-url');
			try {
				user.twitchFollowers = await social.getTwitchFollowers(user.twitch);
			} catch (err) {
				delete user.twitch;
				//console.log(err);
			}
		}
		e = $('div.mlg-networks > span[network-url*="youtube.com"]');
		if(e.length){
			user.youtube = e.attr('network-url');
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
	var e = $('div.boxContent > div.rt > img');
	if(e.length){
		if(e.attr('src').endsWith('/1.png')){
			return 'NA';
		} else if(e.attr('src').endsWith('/2.png')){
			return 'EU';
		}
	}
	return 'Global';
}

function getPlatform(url){
	if(url.toLowerCase().includes('xboxone')){
		return 'Xbox One';
	} else if(url.toLowerCase().includes('ps4')){
		return 'PlayStation 4';
	} else if(url.toLowerCase().includes('pc')){
		return 'PC';
	} else if(url.toLowerCase().includes('mobile')){
		return 'Mobile';
	}
	return 'Unknown';
}

module.exports = mod;