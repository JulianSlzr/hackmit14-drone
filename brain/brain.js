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

var io = require('socket.io')(port);


// BE THE SERVER

// call to ifconfig goes here
var exec = require('child_process').exec;
exec('sudo ifconfig wlan0 192.168.1.2', function (error, stdout, stderr) {
  // output is in stdout
});

io.on('connection', function (socket) {

	console.log('Someone has connected to the brain')

	// This executes when connected to the base station
	socket.on('uploaded', function (data) {
		
		console.log("'uploaded' signal received")

		var ftp = new JSFtp({
			host: "192.168.1.1"
		});

		drone.takeoff();

		hasStopped = false

		drone
			.after(5000, function() {
			    drone.up(0.05);
			})
			.after(5000, function() {
				drone.stop();
				this.front(0.05);
			})
			.after(5000, function() {
				drone.stop();
				hasStopped = true
				
				io.emit('comeatmebro');
			});
			.after(15000, function() {
				drone.back(0.05);
			})
			.after(5000, function() {
				drone.stop();
				drone.land();
			})

		return

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

					if (false)
					{

						for (var i = 0; i < numCmds; i++) {

							var startTime = new Date().getTime() / 1000;
							var lastTimeCheck = startTime;
							var distTraveled = 0;
							var curCmd = cmdList[i];

							if (curCmd.cmd === "GO") {

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

							else if (curCmd.cmd === "PICKUP") {

				    			// SAM'S CODE TO FIND MAX STRENGTH GOES HERE

				    			// This executes when file copy is finished
								socket.on('copied', function (data) {
									
									console.log("base station has copied file")

									// TODO: Come home

								});

				    		}

						    else if (curCmd.cmd === "TURN") {

						    	var targetAngle = curCmd.mag;

						    	drone.clockwise(0.1);

						    	// hard-coded in epsilon for angle variation of 5 deg
						    	var angleEpsilon = 5;
						    	while(true){
						    		if(Math.abs(targetAngle - curAngle) < angleEpsilon){
						    			drone.stop();
						    			break;
						    		}
						    	}
				    		}

				    		else if (curCmd.cmd == "END") {



				    		}

						}

					}
					else
					{
						drone.takeoff();

						hasStopped = false

						drone
							.after(5000, function() {
							    drone.up(0.05);
							})
							.after(5000, function() {
								drone.stop();
								this.front(0.05);
							})
							.after(5000, function() {
								drone.stop();
								hasStopped = true
								io.emit('comeatmebro');
							});
							.after(15000, function() {
								drone.back(0.05);
							})
							.after(5000, function() {
								drone.stop();
								drone.land();
							})

						// // This executes when file copy is finished
						// socket.on('copied', function (data) {
									
						// 	console.log("base station has copied file")

						// 	// TODO: Come home

						// 	while (!hasStopped) {

						// }

					}


				});

			}
		});

	});



});
