// Simple module to get the HTML contents of a page and return it in Promise format
const phantom = require('phantom');
const http = require('http');
const https = require('https');
const URL = require('url');
const createPhantomPool = require('phantom-pool');

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

// Gets the contents of a page and hands it back to the callback function
module.exports = function(url){
	url = url.trim();
	return new Promise( async (resolve, reject) => {
		var ajax = false;
		for(filter of ajaxFilters){
			if(url.includes(filter)){
				ajax = true;
				break;
			}
		}
		if(ajax){
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
		} else {
			var u = URL.parse(url);
			var protocol = (u.protocol == 'https:') ? https : http;
			var options = {
				host: u.host,
				path: u.path,
				headers: {'User-Agent':'javascript'}
			};
			protocol.get(options, res => {
				if(res.statusCode != 200){
					reject(Error('Failed to load page: ' + url));
					return;
				}
				var body = '';
				res.on('data', chunk => { body += chunk });
				res.on('end', () => {
					resolve(body);
				});
			});
		}
	});
};