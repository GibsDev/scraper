//var query = document.getElementById('query');
//var querySubmit = document.getElementById('querySubmit');
var collection = document.getElementById('collection');
var results = document.getElementById('results');

var gameCheck = document.getElementById('gamecheck');
var gameSelection = document.getElementById('game');
var twitterCheck = document.getElementById('twittercheck');
var twitterMin = document.getElementById('twittermin');
var twitchCheck = document.getElementById('twitchcheck');
var twitchMin = document.getElementById('twitchmin');
var youtubeCheck = document.getElementById('youtubecheck');
var youtubeMin = document.getElementById('youtubemin');
var regionCheck = document.getElementById('regioncheck');
var region = document.getElementById('region');
var platformCheck = document.getElementById('platformcheck');
var platform = document.getElementById('platform');
var guiQuerySubmit = document.getElementById('guiQuerySubmit');
var updatedCheck = document.getElementById('updatedcheck');
var updated = document.getElementById('updated');

var clear = document.getElementById('clearResults');

/*
querySubmit.addEventListener('click', click => {
	getResults(collection.value, JSON.parse(query.value));
});
*/

var gameRegex = {
	"BO3": "Call of Duty: Black Ops (3|III)",
	"BO2": "Call of Duty: Black Ops (2|II)",
	"Ghosts": "Call of Duty: Ghosts",
	"IW": "Call of Duty: Infinite Warfare",
	"MWR": "Call of Duty: Modern Warfare.*"
};


// query.value = '{ "twitter": {"$exists": true}, "games": { "$regex": "Call of Duty: Black Ops (3|III)" } }';

function clearResults(){
	results.innerHTML = '';
}

clear.addEventListener('click', clearResults);

guiQuerySubmit.addEventListener('click', click => {
	var query = '{';
	if(gameCheck.checked){
		query += '"games": { "$regex": "' + gameRegex[gameSelection.value] + '" },';
	}
	if(twitterCheck.checked){
		query += '"twitter": { "$exists": true },';
		if(twitterMin.value > 0){
			query += '"twitterFollowers": { "$gt": ' + twitterMin.value + ' },';
		}
	}
	if(twitchCheck.checked){
		query += '"twitch": { "$exists": true },';
		if(twitchMin.value > 0){
			query += '"twitchFollowers": { "$gt": ' + twitchMin.value + ' },';
		}
	}
	if(youtubeCheck.checked){
		query += '"youtube": { "$exists": true },';
		if(youtubeMin.value > 0){
			query += '"youtubeSubscribers": { "$gt": ' + youtubeMin.value + ' },';
		}
	}
	if(regionCheck.checked){
		query += '"region": "' + region.value + '",';
	}
	if(platformCheck.checked){
		query += '"' + platform.value + '": { "$exists": true },';
	}
	if(updatedCheck.checked){
		query += '"updated": { "$gt": "' + updated.value + '" },';
	}
	if(query.endsWith(',')){
		query = query.substring(0, query.length - 1);
	}
	query += '}';
	query = JSON.parse(query);
	getResults('users', query);
});

function getResults(collection, query){
	clearResults();
	if(collection == 'users'){
		var html = '<hr><table>';
		database.query(collection, query).then(docs => {
			html += '<tr>';
				html += '<th>Username</th>';
				html += '<th>Region</th>';
				html += '<th>PSN</th>';
				html += '<th>XBL</th>';
				html += '<th>Twitter</th>';
				html += '<th>Followers</th>';
				html += '<th>Twitch</th>';
				html += '<th>Followers</th>';
				html += '<th>YouTube</th>';
				html += '<th>Subscribers</th>';
				html += '</tr>';
			for(doc of docs){
				html += '<tr>';
				html += '<td><a target="_blank" href="' + doc._id + '">' + doc.username + '</td>';
				html += '<td>' + doc.region + '</td>';
				html += '<td>' + ((doc.psn) ? doc.psn : '') + '</td>';
				html += '<td>' + ((doc.xbl) ? doc.xbl : '') + '</td>';
				var twitter = '';
				if(doc.twitter){
					twitter = doc.twitter.split('/');
					twitter = twitter[twitter.length-1];
				}
				html += '<td><a href="' + ((doc.twitter) ? doc.twitter : '') + '" target="_blank">' + twitter + '</a></td>';
				html += '<td>' + ((doc.twitterFollowers) ? doc.twitterFollowers : '') + '</td>';
				var twitch = '';
				if(doc.twitch){
					twitch = doc.twitch.split('/');
					twitch = twitch[twitch.length-1];
				}
				html += '<td><a href="' + ((doc.twitch) ? doc.twitch : '') + '" target="_blank">' + twitch + '</a></td>';
				html += '<td>' + ((doc.twitchFollowers) ? doc.twitchFollowers : '') + '</td>';
				var youtube = '';
				if(doc.youtube){
					youtube = doc.youtube.split('/');
					youtube = youtube[youtube.length-1];
				}
				html += '<td><a href="' + ((doc.youtube) ? doc.youtube : '') + '" target="_blank">' + youtube + '</a></td>';
				html += '<td>' + ((doc.youtubeSubscribers) ? doc.youtubeSubscribers : '') + '</td>';
				html += '</tr>';
			}
			html += '</table>';
			results.innerHTML = html;
		});
	} else {
		database.query(collection, query).then(docs => {
			for(doc of docs){
				console.log(doc);
				results.innerHTML += '<pre>' + JSON.stringify(doc, null, '\t') + '</pre>';
			}
		});
	}
}
