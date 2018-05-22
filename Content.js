var fs = require("fs");
var path = require("path");
var ffmpeg = require('ffmpeg');
var jimp = require('jimp');

module.exports = class Content {
	constructor(contentFolder, imagesFolder, contentMode, inputContent, inputImgContent) {
		// this._contentFolder = "./content/mediaFiles";
		// this._imagesFolder = "./content/images";
		this._contentFolder = contentFolder;
		this._imagesFolder = imagesFolder;
		this._content=[];
		this._stillContent=[];
		console.log("Loading Files");
		//if it is set to load the entire folder
		if (contentMode == 1) {
			fs.readdirSync(this._contentFolder).forEach(videoFile => {
				this.createThumbnail(videoFile);
			});
		} else {
			//look through the settings json for content
			for(var i = 0, max = inputContent.length; i<max; i++){
				//look through the 
				if (!fs.existsSync(this._imagesFolder + "/" + inputContent[i]["thumbnail"])) {
					//console.log(vcRecord);
					this.createThumbnail(inputContent[i]["videoName"],inputContent[i]["thumbnail"]);
				}
			}
			inputImgContent.forEach(function(inimg){
				if(!fs.existsSync(this._imagesFolder + "/" + inimg["thumbnail"])){
					this.createThumbnail(inimg["photoName"],inimg["thumbnail"]);
				}
			});
			this._content = inputContent;
			this._stillContent = inputImgContent;
		}
	}
	createThumbnail(input,imgname) {
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
								.write(imgfld + "/" + imgname);
							console.log("Cropped: " + imgfld + "/" + imgfilename);
						});
					});
				}
			});
		}, function (err) {
			console.log('Error: ' + err);
		});
	}

	createThumbnailFromImage(input,output){
		jimp.read(this._content+"/"+input, function(err,img){
			if(err) throw err;
			img.cover(200, 200, jimp.HORIZONTAL_ALIGN_CENTER | jimp.VERTICAL_ALIGN_MIDDLE)
								.quality(100)
								.write(this._imagesFolder + "/" + output);
		})
		
	}
}
