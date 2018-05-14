"use strict";
//packages
var express = require('express');
var http = require('http');
var osc = require('node-osc');
var fs = require("fs");
var path = require("path");
var bodyParser = require('body-parser');
var util = require('util');
var ffmpeg = require('ffmpeg');
var jimp = require('jimp');


var debug = true;


//globals

//JSON imports
var settings = require("./content/json/settings");


//instantiate connect object
var app = express();

//create database

var contentDB = new microdb({'file':'./content/contentStore.db'});

class Content{
	constructor(contentFolder,imagesFolder){
		// this._contentFolder = "./content/mediaFiles";
		// this._imagesFolder = "./content/images";
		this._contentFolder = contentFolder;
		this._imagesFolder = imagesFolder;
		console.log("Loading Files");
		fs.readdirSync(this._contentFolder).forEach(videoFile => {
			console.log(response);
			if(response == false){
				console.log("New Content");
				var imgfld = this._imagesFolder;
					var newProcessFile = new ffmpeg(this._contentFolder+"/"+ videoFile);
					newProcessFile.then(function (video){			
						video.fnExtractFrameToJPG(imgfld+"/temp",{
							number:1,
							size:'1000x?',
							every_n_percentage:10,
						},function (error, files) {
							if (!error)
								console.log('ffmpeg: ' + files);
								var imgfilename = path.basename(files);
								jimp.read(imgfld+"/temp/"+imgfilename,function(err,img){
									if(err) throw err;
									img.cover(200,200,jimp.HORIZONTAL_ALIGN_CENTER|jimp.VERTICAL_ALIGN_MIDDLE)
									   .quality(100)
									   .write(imgfld+"/"+imgfilename);
									console.log("Cropped: "+imgfld+"/"+imgfilename);
									fs.unlink(imgfld+"/temp/"+imgfilename);
									var tempjson = {};
								});
						});
					}, function (err) {
						console.log('Error: ' + err);
					});
			} else {
				console.log(response);
			}
		});
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