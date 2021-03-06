// Module for interacting with MongoDB
const MongoClient = require('mongodb').MongoClient;
const MONGO_URL = 'mongodb://localhost:27017/gorilla';
const USERS = 'users';
const TOURNAMENTS = 'tournaments';

var mod = {};

function getDB(){
	return new Promise((resolve, reject) => {
		MongoClient.connect(MONGO_URL, (err, db) => {
			if (err) { reject(err) }
			resolve(db);
		});
	});
}

mod.upsertUser = async function(user){
	// Validate user object
	return mod.upsertOne(user, USERS);
};

mod.upsertTournament = async function(tournament){
	// Validate tournament object
	return mod.upsertOne(tournament, TOURNAMENTS);
};

// Inserts or updates a document into the database
// doc: the document to be inserted
// collection: the collectionf for the doc to be inserted into
// returns a Promise that resolves to the original document put in (not the current version in the db as it would cost another query...)
mod.upsertOne = function(doc, collection, dontChangeUpdateTime){
	// Set the updated field of the document
	if(!dontChangeUpdateTime){
		doc.updated = new Date(Date.now()).toISOString();
	}
	return new Promise(async (resolve, reject) => {
		var database = await getDB();
		// The calculated update object
		var update = {};
		// For each property of 
		for(var key in doc){
			if(doc[key].constructor === Array){
				// If property is an array
				// Create empty objects for properties that don't exist
				if(!update['$addToSet']){
					update['$addToSet'] = {};
				}
				// Create empty objects for properties that don't exist
				if(!update['$addToSet'][key]){
					update['$addToSet'][key] = {};
				}
				// Build the update object { ..., $addToSet: { key: { $each: [] }, ... } }
				update['$addToSet'][key]['$each'] = doc[key];
			} else {
				// Create empty objects for properties that don't exist
				if(!update['$set']){
					update['$set'] = {};
				}
				// Build up update object { $set: { key: value, ... }, ... }
				update['$set'][key] = doc[key];
			}
		}
		// Update the document in the database
		database.collection(collection).update({ _id: doc._id }, update, { upsert: true }).then(response => {
			resolve(doc);
			database.close();
		});
	});
};

function convertDates(obj){
	// For each property of obj
	for(key in obj){
		// Check if it is a nested object
		if(typeof obj[key] === 'object'){
			// Continue to process it
			convertDates(obj);
		} else {
			// Check if it is a date
			var d = new Date(obj[key]);
			if(!isNaN(d.valueOf())){
				obj[key] = d;
			}
		}
	}
}

mod.query = function(collection, query){
	return new Promise(async (resolve, reject) => {
		var database = await getDB();
		var results = database.collection(collection).find(query).toArray().then(results => {
			resolve(results);
			database.close();
		});
	});
};

mod.deleteAll = function(){
	return new Promise(async (resolve, reject) => {
		var database = await getDB();
		database.collection(USERS).deleteMany().then(() => {
			database.collection(TOURNAMENTS).deleteMany().then(() => {
				resolve();
				database.close();
			});
		});
	});
};

module.exports = mod;

/*
User {
	_id (url),
	website, username, region, twitter, twitch, youtube, xbl, psn,
	tournaments[], games[],
	updated
}

Tournament {
	_id (url)
	website, title, region, platform, game, date, entry, teamSize, teamCount,
	users[],
	updated
}
*/
