var server = require('http').Server();
var io = require('socket.io')(server);
var JSFtp = require("jsftp");
var fs = require('fs');
var port = 6000;
var arDrone = require('ar-drone');

var drone  = arDrone.createClient();

// DRONE SETUP

// only leave this in for running on flat surfaces
// drone.ftrim();

// calibrate magnetometer
drone.calibrate(0);

var curAngle;
var curVx;
var curVy;
 

drone.on('navdata', function(d) {
  if (d.demo) {
  	curAngle = d.demo.psi;
  	curVx = d.demo.vx;
  	curVy = d.demo.vy;

  	console.log("ANGLE: " + curAngle);
  	console.log("VX: " + curVx);
  	console.log("VY: " + curVy);
  }
});


// BE THE SERVER

// call to ifconfig goes here

io.on('connection', function (socket) {

	// This executes when connected to the base station
	socket.on('uploaded', function (data) {
		console.log("Connected!")

		var ftp = new JSFtp({
			host: "192.168.1.1"
		});

		// read the file

		ftp.get('plan_brain.txt', 'plan_local.txt', function(hadErr) {
			if (hadErr)
				console.error('There was an error retrieving the file.');
			else {
				console.log('File copied successfully!');

				fs.readFile('plan_local.txt', function(err, data) {

					if (err) throw err;

					var cmdList = JSON.parse(data);
					var numCmds = cmdList.length;
					for (var i = 0; i < numCmds; i++) {
						var startTime = new Date().getTime() / 1000;
						var lastTimeCheck = startTime;
						var distTraveled = 0;
						var curCmd = cmdList[i];
						if(curCmd.cmd === "GO"){

							drone.front(0.5);
							while(true){
								var curTime = new Date().getTime() / 1000;
								distTraveled += ((curTime - lastTimeCheck) * curVx);
								lastTimeCheck = curTime;
								if(distTraveled >= curCmd.mag){
									drone.stop();
									break;
								}
							}
						}

						else if(curCmd.cmd === "PICKUP"){

			    			// SAM'S CODE TO FIND MAX STRENGTH GOES HERE

			    		}

					    else if(curCmd.cmd === "TURN"){

					    	var targetAngle = curCmd.mag;

					    	// hard-coded in epsilon for angle variation of 5 deg
					    	var angleEpsilon = 5;
					    	while(Math.abs(targetAngle - curAngle) > angleEpsilon){



					    	}

			    	// get current orientation
			    	// read off target orientation
			    	// turn clockwise until it matches
			    		}
					}


				});

			}
		});

	});

});


server.listen(port, function() {
	console.log('Listening on ' + port)
});
