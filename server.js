const express = require('express');
const app = express();
const tracker = require('./tracker');
const database = require('./database');

var port = 3000;

app.use(express.static('public'));

app.listen(port, () => {
	console.log('Server listening on port ' + port);
});

app.get('/database', async (req, res) => {
	var collection = req.headers.collection;
	var query = JSON.parse(req.headers.query);
	var response = await database.query(collection, query);
	res.send(response);
});

tracker.start();

// TODO front end stuff