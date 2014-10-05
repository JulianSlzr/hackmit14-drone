var server = require('http').Server();
var io = require('socket.io')(server);
var JSFtp = require("jsftp");
var fs = require('fs');
var port = 6000;

// BE THE SERVER

io.on('connection', function (socket) {

	// This executes when connected to the base station
	socket.on('uploaded', function (data) {
	console.log("Connected!")

		var ftp = new JSFtp({
			host: "192.168.1.1"
		});

		ftp.get('plan_brain.txt', 'plan_local.txt', function(hadErr) {
			if (hadErr)
				console.error('There was an error retrieving the file.');
			else
				console.log('File copied successfully!');
  		});

  		fs.readFile('plan_local.txt', function(err, data) {
  			if (err) throw err;


  			// TODO: INTERPRET FILE COMMANDS
			console.log(data);

  		});

	});

});

server.listen(port, function() {
	console.log('Listening on ' + port)
});
