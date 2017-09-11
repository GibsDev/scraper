const database = require('./database');

var min = new Date(2017, 8, 9, 5).toISOString();
var max = new Date(2017, 8, 10, 5).toISOString();

database.query('tournaments', {_id: 'http://gamebattles.majorleaguegaming.com/ps4/call-of-duty-black-ops-iii/tournament/3v3-1ndone-sd-09-09'}).then(ts => {
	console.log(ts);
});

const gb = require('./gb');

gb.processTournament('http://gamebattles.majorleaguegaming.com/ps4/call-of-duty-black-ops-iii/tournament/3v3-1ndone-sd-09-09').then(t => {
	console.log(t);
});