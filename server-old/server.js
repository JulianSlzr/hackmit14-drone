var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var JSFtp = require("jsftp");
var fs = require('fs');

var iocli = require('socket.io-client');
var socketcli = iocli('http://192.168.1.2:6000');

socketcli.on('connect', function() {
	console.log("Connected to brain.")
});

app.use("/", express.static(__dirname + "/public"));

io.on('connection', function(socket) {

	// Occurs when send button is clicked
	socket.on('upload', function(data) {

		// TODO: Make robot friendly instructions 

		// Convert into text representation

		console.log(data)

		outstr = ""

		for (var i = 0; i < data.length; i++) {
			outstr += data[i][0] + " " + data[i][1] + "\n"
		}

		data = [
			{
				cmd: "GO",
				mag: 100
			},
			{
				cmd: "PICKUP"
			},
			{
				cmd: "TURN",
				mag: 180
			},
			{
				cmd: "GO",
				mag: 100
			},
			{
				cmd: "END"
			}
		]

		outstr = JSON.stringify(data);

		// Upload the flight plan files

		fs.writeFile('plan_server.txt', outstr, function(err) {
		    if(err) {
		        console.log(err);
		    } else {

		    	console.log("File created");

		    	var ftp = new JSFtp({
					host: "192.168.1.1"
				});

				ftp.put('plan_server.txt', 'plan_brain.txt', function(hadError) {

					if (hadError)
						console.log(hadError);
					else
					{
						console.log("File transferred to drone");

						// Tell R.Pi to roam free

						socketcli.emit('uploaded', function() {
							console.log("Sent 'uploaded' signal to brain")
						});

					}
				});

		    }
		}); 


	});
});

var port = 5000;
server.listen(port, function() {
	console.log('Listening on ' + port)
});