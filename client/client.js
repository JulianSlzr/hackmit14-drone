var JSFtp = require("jsftp");
var fs = require('fs');
// var wifiLocation = require('wifi_location');

var iocli = require('socket.io-client');
var socketcli = iocli('http://192.168.1.2:6000', {
	timeout: 99999999
});

var DRONE_SSID = "ardrone2_007420";

var getSignalStrength = function(callback) {
    wifiLocation.wifiTowers(function(err, val) {
        var found = false;
        for (var i = 0; i < val.length; i++) {
            var cur = val[i];
            if (cur.ssid == DRONE_SSID) {
                callback(null, cur.signal_strength);
                found = true;
                break;
            }
        }

        if (!found)
            callback("Drone SSID not found", 1);
    });
}

var emitSignalStrength = function() {
    getSignalStrength(function(err, val) {
        if (!err) {
            socketcli.emit('client-rssi', {value: val});
        }
        else {
            console.log('ahhhhh!');
        }
    });
}

socketcli.on('connect', function() {


	socketcli.on('comeatmebro', function() {

		var ftp = new JSFtp({
	        host: "192.168.1.1"
	    });

	    ftp.put('data.txt', 'data.txt', function(hadError) {
	        if (!hadError)
	        {
	            console.log("File transferred successfully!");

	            socketcli.emit('copied');
	        }
	        else
	            console.log("File transfer error :(");
	    });

	});
	return
    // Use this as a flag to upload files

    emitSignalStrength();

    socketcli.on('poll-rssi', function() {
        emitSignalStrength();
    });

    socketcli.on('request-transfer', function() {
    
    
    });
});
