
var conn = require("JS/conexao.js");
var us = require("userStates");
var Observable = require("FuseJS/Observable");
var alert = require("alertPopup");
var cameraRoll = require("FuseJS/CameraRoll");
var lud = require("JS/loadUserData.js");
var iF = require("JS/imageFunctions.js");
var FileSystem = require("FuseJS/FileSystem");
var routerCalls = require("routerCalls");
var ImageTools = require("FuseJS/ImageTools");

var uname = Observable("");
var nick = Observable("");
var nickEdit = Observable("");
var profilePic = Observable();
var profileUserId = Observable();
var flagEdit = Observable(false);
var userPhotos = Observable();
var groupId = null;
var profilePicUpdate = false;
// FileSystem.listEntries(FileSystem.dataDirectory+"/Photos").then(list=>{
//     console.log(JSON.stringify("lista1:"+list));
// });
this.Parameter.onValueChanged(module,function(param) {
	profileUserId.value = param.userInfo.id;

    if(profileUserId.value == us.userId() && param.flagProfile == "self"){//allows profile picture change if is the logged user profile
    	flagEdit.value = true;
    	lud.getUserProfilePicture(us.userId()).then(function(r){
    		profilePic.value = r;

    	});
    	lud.getUserDataInLdb().then(function(r){
    		(r !=false && r != null) ? nick.value = r.nick:null;
    	});
    	uname.value = "@"+us.userName();

    	var mps = [];
    	lud.deleteNonExistingPostPicsFromLdb().then(function(deleted){
    		return lud.getPhotosInLdb("post");
    	}).then(function(photos){
    		for(var id in photos){
    			if(photos[id].user == us.userId()){
    				mps.push(id);
    			}		
    		}
    		return conn.json('photos/load.php',{
    			item :"get_pictures_of_active_posts",
    			id : us.userId(),
    			my_posted_pictures : mps
    		});
    	}).then(function(mpp){
    		return lud.saveActiveUserPostPictures(mpp);
    	});
    }

    if(param.flagProfile == "group") {
    	groupId = param.groupId;
    	profilePic.value = param.userInfo.photo;
    	profilePicUpdate = (param.userInfo.photo != "Assets/Images/avatar.jpg");
    	//get nick and userName
    	var n = param.userInfo.name.split(" - ");
    	if(n.length == 2){
    		nick.value = n[0];
    		uname.value = n[1];
    	}else{
    		nick.value = "";
    		uname.value = n[0];
    	}
    }
    

    if(param.flagProfile != "self" && profileUserId.value != us.userId()){
    	conn.json('photos/load.php',{
    		item:"user_profile_pic",
    		userId : profileUserId.value
    	}).then(function(b64Obj){
    		if(profilePicUpdate){

    			return lud.saveProfilePicture(b64Obj,profileUserId.value).then(function(r){
    				return lud.getUserProfilePicture(profileUserId.value);
    			});
    		}else{
    			return iF.base64ToImageObj(b64Obj);
    		}
    	}).then(function(path){
    		profilePic.value =  path;
    	});
    }

    //get the user posts

    loadPhotos(param.flagProfile);
});

function loadPhotos(flagProfile){
	lud.getPhotosInLdb("post").then(function(photos){
        //console.log(JSON.stringify(photos));
        for(var id in photos){
        	var verification = false;
        	switch(flagProfile){
        		case "self":
        		verification = (photos[id].user == profileUserId.value);
        		break;
        		case "group":
        		verification = (photos[id].user == profileUserId.value && photos[id].group == groupId);
        		break;
        	}
        	if(verification){
            	verifyAndInsertUserPhoto(id);//needed to ensure that id is the right value for the async action
            }		
        }
    })
}

function verifyAndInsertUserPhoto(id){
	var path = FileSystem.dataDirectory+"/Photos/"+id+".jpg";
	FileSystem.exists(path).then(function(exists){
		exists ? userPhotos.add({path : path, id:id}) : userPhotos.add({path : "Assets/Images/post_placeholder.jpg", id:id});
	});
}


var iniW = 0;
var iniH = 0;
function changeProfilePicture(){
	cameraRoll.getImage().then(function(image) {
        profilePic.value = "Assets/Images/avatar.jpg";
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
        return ImageTools.resize(same, iF.optionsToResizeToMaxResolution(iniW,iniH, true));
    }).then(function(resized){
      conn.photo('photos/add.php',{
        item:'profile_pic',
        uid:us.userId(),
        img:resized
    }).then(function(r){
        return conn.json('photos/load.php',{
            item:"user_profile_pic",
            userId:us.userId()
        });
    }).then(function(r){
        return lud.saveProfilePicture(r,us.userId());
    }).then(function(r){
        return lud.getUserProfilePicture(us.userId());
    }).then(function(image){
        alert.show("Sua foto de perfil foi atualizada com sucesso!");
        profilePic.value = image;
    }).catch(function(error){
        alert.show("Houve um problema com a atualização! Por favor tente novamente.");
    });
});
}

function toggleEditFlag(e){

	// if(!flagEdit.value){
	// 	nickEdit.value = nick.value;
	// 	flagEdit.value = !flagEdit.value;
	// }else{
	// 	flagEdit.value = !flagEdit.value;
	// 	if(nickEdit.value != nick.value){
	// 		conn.json(
	// 			'users/up.php',
	// 			{item:'update_user_info', id:us.userId(), nick:nick.value}
	// 			).then(function(r){
	// 				if(r){
	// 					return lud.getUserDataInLdb().then(function(userData){
	// 						userData.nick = nick.value;
	// 						return lud.saveUserDataInLdb(userData);
	// 					}).then(function(r){
	// 						r !== false ? alert.show("Seus dados foram atualizados com sucesso!") : null;
	// 					});
	// 				}else{
	// 					alert.show("Houve um problema com a atualização! Por favor tente novamente.");
	// 				}
	// 			});
	// 		}
	// 	}
}


function goToPhotoScore(e){
	routerCalls.send({
		router: "main",
		type: "push",
		to: "photoScore",
		data : e.data
	});
}

//
module.exports =
{
	uname : uname,
	nick : nick,
	profilePic : profilePic,
	userPhotos : userPhotos,
	changeProfilePicture :changeProfilePicture,
	flagEdit:flagEdit,
	toggleEditFlag : toggleEditFlag,
	goToPhotoScore : goToPhotoScore
};
