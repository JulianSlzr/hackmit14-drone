var express = require('express');
var app = express();
var server = require('http').Server(app);

app.use("/", express.static(__dirname + "/public"));

var port = process.env.PORT || 9000;
server.listen(port, function() {
	console.log('Listening on ' + port)
});