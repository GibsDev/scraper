var eu = document.getElementById('EU');
var na = document.getElementById('NA');

var colors = [
	'#6666ff',
	'#66ff66',
	'#ff6666',
	'#66ffff',
	'#ff66ff',
	'#ffff66',
];

database.query('tournaments', { "website": "gamebattles.majorleaguegaming.com" }).then(docs => {
	var regions = {};
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
	displayData(na, 'MLG All Time', regions);
});

function displayData(canvas, title, data){
	console.log(data);
	var catagories = [];
	var datasets = [];
	var games = [];
	for(region in data){
		for(platform in data[region]){
			catagories.push(region + ' ' + platform);
			for(game in data[region][platform]){
				if(!games.includes(game)){
					games.push(game);
				}
			}
		}
	}
	for(game of games){
		var d = [];
		for(catagorie of catagories){
			var region = catagorie.split(' ')[0];
			var platform = catagorie.split(' ').slice(1).join(' ');
			if(data[region] == undefined || data[region][platform] == undefined || data[region][platform][game] == undefined){
				d.push(0);
			} else {
				d.push(data[region][platform][game]);
			}
		}
		if(hasPlayers(d)){
			datasets.push({
				label: game,
				data: d
			});
		}
	}

	var naChart = new Chart(canvas, {
		type: 'bar',
		data: {
			labels: catagories,
			datasets: datasets
		},
		options: {
			title: {
				display: true,
				text: title
			},
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero:true
					}
				}]
			}
		}
	});
}


function and(list1, list2){
	var combined = [];
	for(thing of list1){
		if(!combined.includes(thing) && list2.includes(thing)){
			combined.push(thing);
		}
	}
	for(thing of list2){
		if(!combined.includes(thing) && list1.includes(thing)){
			combined.push(thing);
		}
	}
}

function union(list1, list2){
	var combined = [];
	for(thing of list1){
		if(!combined.includes(thing)){
			combined.push(thing);
		}
	}
	for(thing of list2){
		if(!combined.includes(thing)){
			combined.push(thing);
		}
	}
	return combined;
}

function hasPlayers(list){
	var hasPlayers = false;
	for(value of list){
		if(value != 0){
			hasPlayers = true;
			break;
		}
	}
	return hasPlayers;
}