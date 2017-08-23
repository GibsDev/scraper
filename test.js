var scrape = require('./scrape');
var database = require('./database');

var testLinks = [
		'https://umggaming.com/u/Juiceyass',
		'https://umggaming.com/u/We will see',
		'https://umggaming.com/u/bannedaccounttt',
		'https://umggaming.com/u/bigw',
		'https://umggaming.com/u/boner',
		'https://umggaming.com/u/bro',
		'https://umggaming.com/u/chris',
		'https://umggaming.com/u/cosmic',
		'https://umggaming.com/u/crispy',
		'https://umggaming.com/u/daeejayyy',
		'https://umggaming.com/u/deceased',
		'https://umggaming.com/u/detox',
		'https://umggaming.com/u/epicpistol',
		'https://umggaming.com/u/funkyjazz',
		'https://umggaming.com/u/harm',
		'https://umggaming.com/u/heard',
		'https://umggaming.com/u/hostfull',
		'https://umggaming.com/u/hxgoh',
		'https://umggaming.com/u/icsynical',
		'https://umggaming.com/u/intrxsive',
		'https://umggaming.com/u/kingsergie',
		'https://umggaming.com/u/mahzy',
		'https://umggaming.com/u/p00',
		'https://umggaming.com/u/pestacy',
		'https://umggaming.com/u/slayerhaha1',
		'https://umggaming.com/u/strobe',
		'https://umggaming.com/u/swtoxic',
		'https://umggaming.com/u/uni',
		'https://umggaming.com/u/wiscons',
		'https://umggaming.com/u/xcoliny',
		'https://umggaming.com/u/xde',
		'https://umggaming.com/u/xspartan24',
		'https://umggaming.com/u/yeetyaat',
		'https://umggaming.com/u/zhemii'
	];

/*
var promises = [];
var j = 0;
var interval = 1000;
for(var i = 0; i < 3; i++){
	for(link of testLinks){
		j++;
		setTimeout(douser, j * interval, link);
	}
}
console.log(promises);

Promise.all(promises).then().catch(e => {
	console.log(e);
});

function douser(url){
	return new Promise(async (resolve, reject) => {
		var html = await scrape(url);
		return html;
	});
}
async function testSleep(){
	console.log('Hello');
	sleep(2000).then(() => {
		console.log('Sleep!');
	});
}

function sleep(millis){
	return new Promise((resolve, reject) => {
		setTimeout(resolve, millis);
	});
}

testSleep();
*/

// "games": { "$in": ["Black ops 3"] }

database.query('users', { "twitter": {"$exists": true}, "games": { "$regex": "Call of Duty: Black Ops (3|III)" } }).then(docs => {
	console.log(docs);
});