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
var Utility = require('./utilities.js');

var gamingContent = false;

var Content = require ('./Content.js');

//image manipulation
var ffmpeg = require('ffmpeg');
var jimp = require('jimp');
//globals

//JSON imports
var settings = require("./content/json/settings");


//instantiate express objects
var app = express();
var contentRouter = express.Router();

/*
todo
create thumbnails from images
UI
*/

var content = new Content(settings.mediaFiles, settings.imagesFolder, settings.contentMode, settings.videoContent, settings.stillContent);
function selectSources(){
	//select unity & web
	var client = new osc.Client(settings.warpServerIP,settings.warpServerPort);
	client.send("/externalApplication/selected",settings.unityAppName,function(){
		console.log("Selected unity");
	});
	
	client.send("/capture/selected",settings.capturename,function(){
		console.log("Selected web");
	});
}

selectSources();


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




//gaming content
app.use("/gamingToggle",function(req,res,next){
	gamingContent = !gamingContent;
	var client = new osc.Client(settings.warpServerIP,settings.warpServerPort);
	client.send("/externalApplication/selected/enabled",gamingContent ? 1 : 0,function(){
		console.log("Set gaming to " + gamingContent);
		client.kill();
	});
});
//router routes
//videoContent
contentRouter.route("/videoContent/:videoID").get(function(req,res){
	var client = new osc.Client(settings.warpServerIP,settings.warpServerPort);
	client.send("/mov/play",req.params.videoID,function(){
		console.log("Sent Video " + req.params.videoID);
		client.kill();
	});
	res.end("switched to video " + req.params.videoID);
});

//photoContent
contentRouter.route("/photoRotate/:pos/:L/:H").get(function(req,res){
	var pos = parseFloat(req.params.pos);
	var rangeL = parseFloat(req.params.L);
	var rangeH = parseFloat(req.params.H);
	var mapped = Utility.FloatMap(pos,rangeL,rangeH,-1,1);
	client.send("/image/tilt/amount",mapped,function(){
		client.kill();
	});
	console.log(typeof(mapped) + ": "+ mapped);
	res.end(mapped.toString());
});

contentRouter.route("/photoContent/:photoID").get(function(req,res){
	var client = new osc.Client(settings.warpServerIP,settings.warpServerPort);
	client.send("/mov/play",req.params.photoID,function(){
		console.log("Sent Photo " + req.params.photoID);
		client.kill();
	});
	res.end("Switched to Photo " + req.params.photoID);
});

contentRouter.route("/resetSources")
	.get(function(req,res){
		selectSources();
		res.end("reset sources");
	});

//setup api
app.use("/api",contentRouter);


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