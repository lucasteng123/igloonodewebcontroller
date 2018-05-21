"use strict";
//packages
//html
var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
//communication
var osc = require('node-osc');
//file utilities
var fs = require("fs");
var path = require("path");

var util = require('util');

var gamingContent = false;



//image manipulation
var ffmpeg = require('ffmpeg');
var jimp = require('jimp');
//globals

//JSON imports
var settings = require("./content/json/settings");


//instantiate connect object
var app = express();

/*
todo
websocket
look up osc paths
UI
*/



class Content {
	constructor(contentFolder, imagesFolder, contentMode, inputContent) {
		// this._contentFolder = "./content/mediaFiles";
		// this._imagesFolder = "./content/images";
		this._contentFolder = contentFolder;
		this._imagesFolder = imagesFolder;
		this._content=[];
		console.log("Loading Files");
		//if it is set to load the entire folder
		if (contentMode == 1) {
			fs.readdirSync(this._contentFolder).forEach(videoFile => {
				this.createThumbnail(videoFile);
			});
			//look through the settings json for content
		} else {
			inputContent.forEach(vcRecord => {
				if (!fs.existsSync(this._imagesFolder + "/" + vcRecord["thumbnail"])) {
					//console.log(vcRecord);
					this.createThumbnail(vcRecord["videoName"]);
				}
			});
			this._content = inputContent;
		}
	}
	createThumbnail(input) {
		console.log("New Content");
		var imgfld = this._imagesFolder;
		var newProcessFile = new ffmpeg(this._contentFolder + "/" + input);
		newProcessFile.then(function (video) {
			video.fnExtractFrameToJPG(imgfld + "/temp", {
				number: 1,
				size: '1000x?',
				every_n_percentage: 10,
			}, function (error, files) {
				if (!error){
					console.log('ffmpeg: ' + files);
					files.forEach(ffile=>{
						var imgfilename = path.basename(ffile);
						jimp.read(imgfld + "/temp/" + imgfilename, function (err, img) {
							if (err) throw err;
							img.cover(200, 200, jimp.HORIZONTAL_ALIGN_CENTER | jimp.VERTICAL_ALIGN_MIDDLE)
								.quality(100)
								.write(imgfld + "/" + imgfilename);
							console.log("Cropped: " + imgfld + "/" + imgfilename);
						});
					});
				}
			});
		}, function (err) {
			console.log('Error: ' + err);
		});
	}
}


var content = new Content(settings.mediaFiles, settings.imagesFolder, settings.contentMode, settings.videoContent);

//testing of OSC
app.use('/oscTest', function (req, res, next) {
	//send test message to server
	var client = new osc.Client(settings.warpServerIP, settings.warpServerPort);
	client.send('/testOSC', 150, function () {
		//clean up client object
		client.kill();
	});
	//log it
	console.log("Test OSC sent");
	res.end("osc sent successfully");

});

//video content
app.use("/videoContent",function(req,res,next){
	//get int from url or post
	var input = 0;
	var client = new osc.Client(settings.warpServerIP,settings.warpServerPort);
	client.send("/video",content._content[input].videoName,function(){
		console.log("Sent Video " + content._content.videoName);
		client.kill();
	});
});

//photo content
app.use("/photoSwitch",function(req,res,next){

});

//websocket photosphere



//gaming content
app.use("/gamingToggle",function(req,res,next){
	gamingContent = !gamingContent;
	var client = new osc.Client(settings.warpServerIP,settings.warpServerPort);
	client.send("/spout",content._content[input].videoName,function(){
		console.log("Set gaming to " + gamingContent);
		client.kill();
	});
});



//generic response
app.use(function (req, res) {
	res.end("Hello from Igloo \n");
});

//error handling
app.use(function onerror(err, req, res, next) {
	throw err;
});
//startup logging
http.createServer(app).listen(settings.httpServerPort);
console.log("http server started at port " + settings.httpServerPort);
console.log("OSC sending to " + settings.warpServerIP + ":" + settings.warpServerPort);

//lucas