// Simple module to get the HTML contents of a page and return it in Promise format
const phantom = require('phantom');
const http = require('http');
const https = require('https');
const URL = require('url');
const createPhantomPool = require('phantom-pool');

const agent = 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36';

// Returns a generic-pool instance
const pool = createPhantomPool({
	max: 4,
	min: 0,
	maxUses: 5
});

var ajaxFilters = [
	'profile.majorleaguegaming.com',
	'twitch.tv',
];

var requests = {};

var interval = 2000;

// Gets the contents of a page and hands it back to the callback function
module.exports = function(url){
	url = url.trim();
	var u = URL.parse(url);
	if(requests[u.hostname] == undefined){
		requests[u.hostname] = [];
	}
	var delay = requests[u.hostname].length * interval;
	requests[u.hostname].push(url);
	return new Promise( async (resolve, reject) => {
		var ajax = false;
		for(filter of ajaxFilters){
			if(url.includes(filter)){
				ajax = true;
				break;
			}
		}
		setTimeout((ajax) ? ajaxRequest : basicRequest, delay, url, resolve, reject);
	});
};

function ajaxRequest(url, resolve, reject){
	console.log('Processing: ' + url);
	// Perhaps this needs to be a promise as well
	pool.use(async instance => {
		var page = await instance.createPage();
		var status = await page.open(url);
		if(status != 'success'){
			reject(Error('Failed to load page: ' + url));
		}
		var content = await page.property('content');
		return content
	}).then(content => {
		resolve(content);
	});
	var u = URL.parse(url);
	requests[u.hostname] = requests[u.hostname].filter(e => e !== url);
}

function basicRequest(url, resolve, reject){
	console.log('Processing: ' + url);
	var u = URL.parse(url);
	var protocol = (u.protocol == 'https:') ? https : http;
	var options = {
		host: u.host,
		path: u.path,
		headers: {'User-Agent':'javascript'}
	};
	protocol.get(options, res => {
		if(res.statusCode != 200){
			reject(Error('Failed to load page (' + res.statusCode + '): ' + url));
			return;
		}
		var body = '';
		res.on('data', chunk => { body += chunk });
		res.on('end', () => {
			resolve(body);
		});
	});
	var u = URL.parse(url);
	requests[u.hostname] = requests[u.hostname].filter(e => e !== url);
}


function sleep(millis){
	return new Promise((resolve, reject) => {
		setTimeout(resolve, millis);
	});
}