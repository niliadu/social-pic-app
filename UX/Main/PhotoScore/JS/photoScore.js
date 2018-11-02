var Observable = require('FuseJS/Observable');
var conn = require("JS/conexao.js");
var us = require("userStates");
var lud = require("JS/loadUserData.js");
var alert = require("alertPopup");
var routerCalls = require("routerCalls");
var sysVars = require("JS/systemVars");
var consts = require("JS/constants.js");

var photo = Observable("Assets/Images/post_placeholder.jpg");
var titlePhoto = Observable("");
var photoData = null;
var photoAverageScore = Observable();
var canGiveScore = false;

var stars = Observable();

this.Parameter.onValueChanged(module,function(param) {
	photoId = param.id;
	lud.getPhotosInLdb("post").then(function(photos){
		for(id in photos){
			if(id == photoId){
				photoData = photos[id];
			}
		}
		return null;
	}).then(function(r){

		titlePhoto.value = photoData.title
		if(photoData.user == us.userId()){
			lud.getPostPicture(photoId).then(function(path){
				if(path == "Assets/Images/post_placeholder.jpg"){
					alert.show("Esta imagem deve ter sido deletada do seu aparelho.")
				}else{
					photo.value = path;
				}
			});
			conn.json('photos/load.php',{
				item : 'get_average_score',
				id : photoId
			}).then(function(avgScore){
				photoAverageScore.value = avgScore.toString().substring(0,3);
				console.log("chegou aqui");
				stars.replaceAll([]);
			});
		}else{

			stars.add({val: 1, star: consts.icons.starBorder});
			stars.add({val: 2, star: consts.icons.starBorder});
			stars.add({val: 3, star: consts.icons.starBorder});
			stars.add({val: 4, star: consts.icons.starBorder});
			stars.add({val: 5, star: consts.icons.starBorder});

			photoData.score == null ? canGiveScore = true : changeStars(photoData.score);
			if(!photoData.vis){
				conn.json('photos/load.php',{
					item:"get_post_picture",
					id:photoId
				}).then(function(picObj){
					if(picObj == false){
						//deletar foto ?
					}else{
						lud.savePostPictures(picObj, photoId).then(function(r){
							if(r != false ){ 
								photo.value = r;
								photoData.vis = true;

								lud.updatePhotoInformation('post', photoData).then(function(r){
									conn.json('photos/load.php',{
										item : 'get_average_score',
										id : photoId
									}).then(function(avgScore){
										photoData.score == null ? canGiveScore = true : changeStars(photoData.score);
										photoAverageScore.value = avgScore.toString().substring(0,3);
									});
								});
							}
						});
					}
				});
			}else{
				lud.getPostPicture(photoId).then(function(path){
					if(path == "Assets/Images/post_placeholder.jpg"){
						alert.show("Esta imagem deve ter sido deletada do seu aparelho.")
					}else{
						photo.value = path;
					}
				});	
			}
			
			conn.json('photos/load.php',{
				item : 'get_average_score',
				id : photoId
			}).then(function(avgScore){
				if(avgScore != null){
					photoAverageScore.value = avgScore.toString().substring(0,3);
				}
			});

		}
	});

});

function changeStars(clicked){
	newStars = [];
	stars.forEach(function(obj){
		var s = obj.val <= clicked ? consts.icons.star : consts.icons.starBorder;
		newStars.push({val : obj.val , star : s});
	});
	stars.replaceAll(newStars);
}

function saveScore(e){
	if(canGiveScore){
		changeStars(e.data.val);
		conn.json('photos/add.php', {
			item : "score",
			score :e.data.val, 
			photo :photoId,
			user : us.userId()
		}).then(function(r){
			if(r == null){
				alert.show("Houve um problema ao enviar sua nota. Por favor tente novamente.");
			}else{
				photoData.score = e.data.val;
				photoData.visCountID = r;

				lud.updatePhotoInformation('post', photoData).then(function(r){
					if(r == false || r == null){
						alert.show("Houve um erro ao salvar sua nota! Por favor tente novamente.");
					}else{
						alert.show("Sua nota foi salva com sucesso!");
						canGiveScore = false;
						conn.json('photos/load.php',{
							item : 'get_average_score',
							id : photoId
						}).then(function(avgScore){
							photoAverageScore.value = avgScore.toString().substring(0,3);
						});
					}
				});
			}
		});
	}
}

module.exports = {
	photo : photo,
	titlePhoto : titlePhoto,
	photoAverageScore : photoAverageScore,
	saveScore : saveScore,
	stars : stars,
};
