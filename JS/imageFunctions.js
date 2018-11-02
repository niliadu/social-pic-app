var sysVars = require("JS/systemVars");
var ImageTools = require("FuseJS/ImageTools");

function imageObjToBase64(image){
	if(image == null){
		return new Promise(function(resolve, reject){
			resolve(null);
		});
	}else{
  		//creates a promisse that will read the file and can be chained with its upload
  		return new Promise(function(resolve, reject){
  			var reader  = new FileReader();
  			reader.onloadend = function(){
  				console.log("aqui");
  				resolve(reader.result);
  			}
  			reader.readAsDataURL(image);
  		});
  	}
  }					

  function base64ToImageObj(base64Obj){
  	return new Promise(function(resolve, reject){
  		if(base64Obj == null){
  			resolve("Assets/Images/avatar.jpg");
  		}else{
  			var base64 = base64Obj.base64.split(",");
  			const r = ImageTools.getImageFromBase64(base64[1]).then(function(image){
  				return image.path;
  			},function(error){
  				return "Assets/Images/avatar.jpg";
  			})
  			resolve(r);
  		}
  	});
  }

  function optionsToResizeToMaxResolution(width, height, profile){
  	var maxSize = profile ? sysVars.maxPerfilPhotoSize : sysVars.maxPhotoSize;
  	if(width > maxSize && height > maxSize){
  		var desiredW = 0;
  		var desiredH = 0;
  		if(width > height){
  			desiredH = maxSize;
  			desiredW = maxSize*(width/height);
  		}else if(height > width){
  			desiredW = maxSize;
  			desiredH = maxSize*(height/width);
  		}else{
  			desiredW = desiredH = maxSize;
  		}
  		var options = {
  			mode: ImageTools.IGNORE_ASPECT,
  			desiredWidth: desiredW, 
  			desiredHeight: desiredH+1
  		};
  	}else{
  		var options = {
        mode: ImageTools.IGNORE_ASPECT,
  			desiredWidth: width, 
  			desiredHeight: height+1
  		};
  	}
  	return options;
  }

  module.exports = {
  	imageObjToBase64 : imageObjToBase64,
  	optionsToResizeToMaxResolution : optionsToResizeToMaxResolution,
  	base64ToImageObj : base64ToImageObj
  }