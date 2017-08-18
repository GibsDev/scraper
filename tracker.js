// Responsible for organizing scrapers together and automatically processing tournaments
const database = require('./database');

const gb = require('./gb');
const umg = require('./umg');

var url = 'http://gamebattles.majorleaguegaming.com/xboxone/call-of-duty-modern-warfare/tournament/3v3-amateur-sd-08-16';

// TODO schedule tournament processor and do umg

var scrapers = [
	gb,
	umg
];

var scheduledTournaments = [];

async function scheduleTournaments(){
	console.log('Checking for new tournaments...');
	var scheduled = 0;
	for(scraper of scrapers){
		var tournaments = await scraper.checkTournaments();
		for(tournament of tournaments){
			var exists = false;
			// Check if it exists already
			for(scheduledTournament of scheduledTournaments){
				if(scheduledTournament.link == tournament.link){
					exists = true;
					break;
				}
			}
			if(!exists){
				// Get number of milliseconds until 10 minutes after start time
				var millis = tournament.date.valueOf() - Date.now() + (1000 * 60 * 10);
				setTimeout(processTournament, millis, scraper, tournament.link);
				scheduledTournaments.push(tournament);
				scheduled++;
			}
		}
	}
	if(scheduled > 0){
		console.log(scheduled + ' new tournaments scheduled.');
	} else {
		console.log('No new tournaments.');
	}
}

async function processTournament(scraper, url){
	console.log('Processing tournament: ' + url);
	// TODO remove tournament from scheduled
	var tournament = await scraper.processTournament(url);
	// Remove directly placed documents of users with the _ids
	var promises = [];
	var users = tournament.users;
	tournament.users = [];
	for(user of users){
		promises.push(database.upsertUser(user));
		tournament.users.push(user._id);
	}
	promises.push(database.upsertTournament(tournament));
	Promise.all(promises).then(docs => {
		database.query({}, 'users').then(users => {
			console.log(users);
		});
		database.query({}, 'tournaments').then(tournaments => {
			console.log(tournaments);
		});
	});
}


var mod = {};

mod.start = function(){
	setInterval(scheduleTournaments, 1000 * 60 * 30); // 30 minutes
	scheduleTournaments();
};

module.exports = mod;