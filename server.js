//packages
var connect = require('connect');
var http = require('http');
var osc = require('node-osc');

//port declarations
var warpServerIP = '127.0.0.1';
var warpServerPort = 9001;
var httpServerPort = 3000;

//instantiate connect object
var app = connect();

//testing of OSC
app.use('/oscTest', function(req, res, next){
	//send test message to server
	var client = new osc.Client(warpServerIP,warpServerPort);
	client.send('/testOSC',150,function(){
		//clean up client object
		client.kill();
	});
	//log it
	console.log("Test OSC sent");
	res.end("osc sent successfully");

});



//endpoint to change server ip
app.use('/setServerIp', function(req,res,next){

});

//endpoint to change server port
app.use('/setServerPort', function(req,res,next){

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
http.createServer(app).listen(httpServerPort);
console.log("http server started at port " + httpServerPort); 
console.log("OSC sending to " + warpServerIP + ":" + warpServerPort);

//lucas