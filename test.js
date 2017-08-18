var scrape = require('./scrape');
var database = require('./database');


var user = {
	_id: '1234',
	username: 'coolusername',
	website: 'mlg.stuff',
	region: 'EU',
	tournaments: ['t1','t2','t3'],
	platforms: ['p1'],
	games: ['g1']
};

var userU = {
	_id: '1234',
	username: 'coolusernamed',
	website: 'somewebsite',
	region: 'NA',
	twitter: 'twitter',
	tournaments: ['t6'],
	platforms: ['p4'],
	games: ['g3']
}

doStuff = async () => {
	try {
		await database.deleteAll();
		await database.upsertUser(user);
		var docs = await database.query({}, 'users');
		console.log(docs);
		await database.upsertUser(userU);
		var docs = await database.query({}, 'users');
		console.log(docs);
	} catch (err) {
		console.log(err);
	}
	await database.close();
};

//doStuff();

var gb = require('./gb');
var umg = require('./umg');

/*
gb.checkTournaments().then(tournaments => {
	console.log(tournaments);
});
*/


var profile = 'http://profile.majorleaguegaming.com/-OaKLeY-';
var url = 'https://umggaming.com/tournaments/2250';

umg.processTournament(url).then(tournament => {
	console.log(tournament);
});

/*
gb.processUser(profile, 'tournament', 'region', 'game').then(user => {
	console.log(user);
});
*/

/*
scrape(profile).then(html => {
	console.log(html);
});
*/
