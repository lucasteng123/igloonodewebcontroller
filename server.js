"use strict";
//packages
var express = require('express');
var http = require('http');
var osc = require('node-osc');
var fs = require("fs");
var bodyParser = require('body-parser');
var util = require('util');
var microdb = require('nodejs-microdb');
var ffmpeg = require('ffmpeg');
var jimp = require('jimp');


var debug = true;


//globals

//JSON imports
var settings = require("./content/json/settings");


//instantiate connect object
var app = express();

//create database

var content = new microdb({'file':'./content/contentStore.db'});

class Content{
	constructor(contentFolder,imagesFolder){
		// this._contentFolder = "./content/mediaFiles";
		// this._imagesFolder = "./content/images";
		this._contentFolder = contentFolder;
		this._imagesFolder = imagesFolder;
		console.log("Loading Files");
		this.videos = [];
		fs.readdirSync(this._contentFolder).forEach(file => {
			var response = content.find("mediaFile",file);
			if(response == false){
				console.log("New Content");
					var newProcessFile = new ffmpeg("./content/mediaFiles/"+ file);
					newProcessFile.then(function (video){
						
						video.fnExtractFrameToJPG("./content/images/temp",{
							number:1,
							size:'1000x?',
							every_n_percentage:10,

						},function (error, files) {
							if (!error)
								console.log('Frames: ' + files);
						});

					}, function (err) {
						console.log('Error: ' + err);
					});

			} else {
				console.log(response);
			}
			console.log(file);
		});
		if(this.videos == null){
			console.log("Error: No Files Found");
			exit();
		}

	}
}

var content = new Content(settings.mediaFiles,settings.imagesFolder);

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