//packages
var connect = require('connect');
var http = require('http');
var osc = require('node-osc');

var serverIP = '127.0.0.1';
var serverPort = 9001;

var app = connect();
//testing of OSC
app.use('/oscSend', function(req, res, next){
	var client = new osc.Client(serverIP,serverPort);

	client.send('/testOSC',150,function(){
		client.kill();
	});
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
	res.end("Hello from Connect \n");
});

//error handling
app.use(function onerror(err,req,res,next){
	throw err;
});

http.createServer(app).listen(3000);