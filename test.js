var scrape = require('./scrape');
var database = require('./database');

var regions = {};

database.query('tournaments', { "website": "gamebattles.majorleaguegaming.com", "updated": { "$lt": new Date(2017, 7, 19, 7) } }).then(docs => {
	for(doc of docs){
		if(regions[doc.region] == undefined){
			regions[doc.region] = {};
		}
		if(regions[doc.region][doc.platform] == undefined){
			regions[doc.region][doc.platform] = {};
		}
		if(regions[doc.region][doc.platform][doc.game] == undefined){
			regions[doc.region][doc.platform][doc.game] = 0;
		} else {
			regions[doc.region][doc.platform][doc.game] += doc.users.length;
		}
	}
	console.log(regions);
});