var JSFtp = require("jsftp");
var fs = require('fs');
var wifiLocation = require('wifi_location');

var iocli = require('socket.io-client'),
socketcli = iocli.connect('192.168.1.2', {
    port: 6000
});

// TODO: Stay alive FOREVER?
// not sure if this is correct
iocli.Manager.timeout(false);

socketcli.on('connect', function () {

	// Use this as a flag to upload files

	var ftp = new JSFtp({
		host: "192.168.1.1"
	});

	ftp.put('data.txt', 'data.txt', function(hadError) {
	  if (!hadError)
	    console.log("File transferred successfully!");
	});

});