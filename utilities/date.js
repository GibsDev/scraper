// A script used for updating dates in the DB to ISO strings

var database = require('./database');

/*
database.query('tournaments', {}).then(tournaments => {
	console.log(tournaments);
});
*/

/*
database.query('tournaments', {}).then(tournaments => {
	updateTournaments(tournaments);
});
*/

async function updateTournaments(tournaments){
	for(var i = 0; i < tournaments.length; i++){
		var t = tournaments[i];
		console.log('Updating tournament: ' + (i + 1) + '/' + tournaments.length);
		await updateTournament(t);
	}
}

function updateTournament(t){
	return new Promise(async (resolve, reject) => {
		t.date = new Date(t.date).toISOString();
		t.updated = new Date(t.updated).toISOString();
		
		database.upsertOne(t, 'tournaments', true).then(() => {
			resolve();
		});
		
	});
}


database.query('tournaments', {}).then(tournaments => {
	console.log(tournaments);
});


/*
database.query('users', {}).then(users => {
	updateUsers(users);
});
*/

async function updateUsers(users){
	for(var i = 0; i < users.length; i++){
		var u = users[i];
		console.log('Updating user: ' + (i + 1) + '/' + users.length);
		await updateUser(u);
	}
}

function updateUser(u){
	return new Promise(async (resolve, reject) => {
		u.updated = new Date(u.updated).toISOString();
		
		database.upsertOne(u, 'users', true).then(() => {
			resolve();
		});
		
	});
}