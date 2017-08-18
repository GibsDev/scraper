var database = {};

database.query = function(collection, query){
	return new Promise((resolve, reject) => {
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				// Typical action to be performed when the document is ready:
				resolve(JSON.parse(xhttp.responseText));
			}
		};
		xhttp.open('GET', '/database', true);
		xhttp.setRequestHeader('query', JSON.stringify(query));
		xhttp.setRequestHeader('collection', collection);
		xhttp.send();
	});
};