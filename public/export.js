(function(){
	
//var summary = document.getElementById('summary');
var summaryView = document.getElementById('summaryView');

var summaryMinDate = document.getElementById('summaryMinDate');
var summaryMaxDate = document.getElementById('summaryMaxDate');
var summaryMinTime = document.getElementById('summaryMinTime');
var summaryMaxTime = document.getElementById('summaryMaxTime');

var summaryResults = document.getElementById('summaryResults');

function getResults(download){
	var minDate = summaryMinDate.value;
	var maxDate = summaryMaxDate.value;
	var baseQuery = { 'date': { '$gt': minDate, '$lt': maxDate } };
	var results = {};
	database.query('tournaments', baseQuery).then(docs => {
		console.log(docs);
		for(doc of docs){
			if(results[doc.website] == undefined){
				results[doc.website] = {};
			}
			if(results[doc.website][doc.region] == undefined){
				results[doc.website][doc.region] = {};
			}
			if(results[doc.website][doc.region][doc.platform] == undefined){
				results[doc.website][doc.region][doc.platform] = {};
			}
			if(results[doc.website][doc.region][doc.platform][doc.game] == undefined){
				results[doc.website][doc.region][doc.platform][doc.game] = doc.teamCount * doc.teamSize;
			} else {
				results[doc.website][doc.region][doc.platform][doc.game] += doc.teamCount * doc.teamSize;
			}
		}
		summaryResults.innerHTML = '';
		var html = '<hr>';
		html += '<table>';
		html += '<tr>';
		html += '<th>Website</th>';
		html += '<th>Region</th>';
		html += '<th>Platform</th>';
		html += '<th>Game</th>';
		html += '<th>Player Count</th>';
		html += '</tr>';
		for(website in results){
			for(region in results[website]){
				for(platform in results[website][region]){
					for(game in results[website][region][platform]){
						html += '<tr>';
						html += '<td>' + ((website.includes('game')) ? 'MLG' : 'UMG' ) + '</td>';
						html += '<td>' + region + '</td>';
						html += '<td>' + platform + '</td>';
						html += '<td>' + game + '</td>';
						html += '<td>' + results[website][region][platform][game] + '</td>';
						html += '</tr>';
					}
				}
			}
		}
		html += '</table>';
		summaryResults.innerHTML = html;
		if(download){
			// TODO download
		}
	});
}

summaryView.addEventListener('click', getResults);
//summary.addEventListener('click', getResults, true);

function pad(n, width, z) {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

})();
