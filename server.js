//packages
var express = require('express');
var http = require('http');
var osc = require('node-osc');
var fs = require("fs");
var bodyParser = require('body-parser');

//port declarations

//JSON imports
var settings = require("./content/json/settings");

//instantiate connect object
var app = express();

//testing of OSC
app.use('/oscTest', function(req, res, next){
	//send test message to server
	var client = new osc.Client(settings.warpServerIP,settings.warpServerPort);
	client.send('/testOSC',150,function(){
		//clean up client object
		client.kill();
	});
	//log it
	console.log("Test OSC sent");
	res.end("osc sent successfully");

});



//generic response
app.use(function(req,res){
	res.end("Hello from Igloo \n");
});

//error handling
app.use(function onerror(err,req,res,next){
	throw err;
});

//startup logging
http.createServer(app).listen(settings.httpServerPort);
console.log("http server started at port " + settings.httpServerPort); 
console.log("OSC sending to " + settings.warpServerIP + ":" + settings.warpServerPort);

//lucas