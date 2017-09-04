// TODO go through each UMG tournament up fix the platform field
const database = require('./database');
const umg = require('./umg');

database.query('tournaments', { website: 'umggaming.com' }).then(async docs => {
	//console.log(docs);
	for(var i = 0; i < docs.length; i++){
		console.log('Updating tournament ' + (i + 1) + '/' + docs.length);
		var t = await umg.simpleProcess(docs[i]._id);
		console.log(t);
		await database.upsertOne(t, 'tournaments', true);
	}
});

/*

umg.processTournament('https://umggaming.com/tournaments/2448').then(t => {
	console.log(t);
});
*/