var query = document.getElementById('query');
var querySubmit = document.getElementById('querySubmit');
var collection = document.getElementById('collection');
var results = document.getElementById('results');

querySubmit.addEventListener('click', click => {
	getResults(collection.value, JSON.parse(query.value));
});

function getResults(collection, query){
	results.innerHTML = '';
	database.query(collection, query).then(docs => {
		for(doc of docs){
			results.innerHTML += '<pre>' + JSON.stringify(doc, null, '\t') + '</pre>';
		}
	});
}