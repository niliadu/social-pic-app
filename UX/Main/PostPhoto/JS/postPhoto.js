var Observable = require('FuseJS/Observable');
var cameraRoll = require("FuseJS/CameraRoll");
var camera = require("FuseJS/Camera");
var ImageTools = require("FuseJS/ImageTools");
var conn = require("JS/conexao.js");
var us = require("userStates");
var lud = require("JS/loadUserData.js");
var alert = require("alertPopup");
var routerCalls = require("routerCalls");
var sysVars = require("JS/systemVars");
var imageFunctions = require("JS/imageFunctions.js");

var postPic = Observable();
var photoToPost = null;
var groupId = null;
var titlePhoto = Observable("");


this.Parameter.onValueChanged(module,function(param) {
	groupId = param.groupId;
	var iniW = 0;
	var iniH = 0;
	getImage(param.takePic).then(function(image){
		postPic.value = image;
		iniW = image.width;
		iniH = image.height;
		if(iniW>iniH){
			var options = {
				x : (iniW - iniH)/2,
				y : 0,
				width : iniH,
				height : iniH,
				performInPlace : false
			};
			iniW = iniH;
		}else if(iniH>iniW){
			var options = {
				x : 0,
				y : (iniH - iniW)/2,
				width : iniW,
				height : iniW,
				performInPlace : false
			};
			iniH = iniW;
		}else{
			var options = {
				x : 0,
				y : 0,
				width : iniW,
				height : iniW,
				performInPlace : false
			};
		}
		return ImageTools.crop(image, options);
	}).then(function(same){
		return ImageTools.resize(same, imageFunctions.optionsToResizeToMaxResolution(iniW,iniH));
	}).then(function(resized){
		photoToPost = resized;
	}).catch(function(error) {
		console.log("takePicture error: "+JSON.stringify(error));
		console.log("takePicture error: "+JSON.stringify(error.message));
		routerCalls.getMainRouter().getRoute(function(route){
			if(route[0] == "postPhoto"){
				routerCalls.send({
					router : "main",
					type:"go",
					to:"back", 
				});
			}
		});
	})
});

function getImage(takePic){
	if(takePic){
		return camera.takePicture(sysVars.maxPhotoSize);
	}else{
		return cameraRoll.getImage();
	}
}

function postPhoto(){
	console.log("entrou"+JSON.stringify(photoToPost));
	conn.photo(
		'photos/add.php',
		{
			item : "new_post",
			groupId : groupId,
			userId : us.userId(),
			img : photoToPost,
			title : titlePhoto.value
		}).then(function(r){
			console.log(JSON.stringify(r));
			if(r != null ){
				var imgA = [];
				r.group = groupId;
				var imgData = r;
				imgA.push(r);
				
				return lud.savePhotosInLdb('post',imgA).then(function(r){
					if(r == false) {
						alert.show("Houve um problema na postagem da foto. Por favor tente novamente");
					}else{
						lud.movePostPicture(photoToPost, imgData.id)
						.then(function(picObj){
							return cameraRoll.publishImage(picObj);
						})
						.then(function(published){
							alert.show("Foto postada com sucesso!");
							routerCalls.getMainRouter().getRoute(function(route){
								if(route[0] == "postPhoto"){
									routerCalls.send({
										router : "main",
										type:"go",
										to:"back", 
									});
								}
							});
						});
					}	
				});
			}else{
				return null;
			}
		}).catch(function(e){
			alert.show("Houve um problema na postagem da foto. Por favor tente novamente");
			console.log("postPhoto:"+JSON.stringify(e));
		});
	}

	module.exports = {
		postPic : postPic,
		titlePhoto : titlePhoto,
		postPhoto : postPhoto
	};
