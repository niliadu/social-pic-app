var conn = require("JS/conexao.js");
var FileSystem = require("FuseJS/FileSystem");
var us = require("userStates");
var iT = require("FuseJS/ImageTools");
var sysVars = require("JS/systemVars");

function fromServer(){
	if(!sysVars.runningFromServer){
		sysVars.runningFromServer = true;
		var returnData = null;

		const r =  conn.json('users/load.php',{
			item:'get_user_data_update',
			id:us.userId()
		}).then(function(response){
			returnData = response;
			return saveUserDataInLdb(returnData.userData);
		}).then(function(savedData){
			return saveUserGroupsInLdb(returnData.groups);
		}).then(function(savedGroups){
			return savePhotosInLdb("post", returnData.postPics);
		}).then(function(savedPhotos){
			us.callNewInformationSaved();//warn to listners that a new grupo of informations were saved in the local db
			sysVars.runningFromServer = false;
			return true;
		}).catch(function(error){
			sysVars.runningFromServer = false;
			console.log("fromServer: "+JSON.stringify(error.message));
			console.log("fromServer: "+JSON.stringify(error));
			return null;
		});
		return r;
	}else{
		return false;
	}
}
//////////////////////////////////////////////////////////////////////////////////
function saveProfilePicture(picObj, id){
	path = FileSystem.dataDirectory+"/Profiles/"+id+".jpg";
	if(picObj == null){
		const r = FileSystem.exists(path).then(function(r){
			if(r){
				return FileSystem.delete(path);
			}
		}).catch(function(error){
			console.log("saveProfilePictureNull: "+JSON.stringify(error.message));
		});
		return r;
	}else if(picObj != false){
		var base64 = picObj.base64.split(",");
		const r = iT.getImageFromBase64(base64[1]).then(function(image){
			return FileSystem.readBufferFromFile(image.path);
		},function(error){
			throw new Error("Imagem nao decodificada");
		}).then(function(buffer){
			return FileSystem.writeBufferToFile(path, buffer).then(function(r){
				return true;
			},function(e){
				throw new Error(e);
			});
		}).catch(function(error){
			console.log("saveProfilePicture: "+JSON.stringify(error.message));
		});
		return r;
	}
	
}

function getUserProfilePicture(userId){
	const r = FileSystem.exists(FileSystem.dataDirectory+"/Profiles/"+userId+".jpg").then(function(r){
		var path = r ? FileSystem.dataDirectory+"/Profiles/"+userId+".jpg" : "Assets/Images/avatar.jpg";
		return path;
	}).catch(function(e){
		console.log("getUserProfilePicture: "+JSON.stringify(e));
		return null;
	});
	return r;
}

function getPostPicture(id){
	const r = FileSystem.exists(FileSystem.dataDirectory+"/Photos/"+id+".jpg").then(function(r){//
		var path = r ? FileSystem.dataDirectory+"/Photos/"+id+".jpg" : "Assets/Images/post_placeholder.jpg";
		return path;
	}).catch(function(e){
		console.log("getUserProfilePicture: "+JSON.stringify(e));
		return null;
	});
	return r;
}

function saveUsersProfilePictures(profilePics){
	return new Promise(function(res, rej){
		try{
			path = FileSystem.dataDirectory+"/Profiles/";
			var array =[];
			for (var picID in profilePics){
				(profilePics[picID] != false && profilePics[picID] != null) ? array.push({picID:picID, picObj: profilePics[picID]}) : null;
			}
			array.reduce(function(curr,next){
				return curr.then(function(){
					return promiseSaveUsersUserProfilePictures(next.picObj, next.picID)
				});

			}, Promise.resolve()).then(function(r){
				res(r);
			});
		}catch(e){
			console.log("saveUsersProfilePictures: "+JSON.stringify(e.message));
			console.log("saveUsersProfilePictures: "+JSON.stringify(e));
			rej(e);
		}
	});
}

function promiseSaveUsersUserProfilePictures(picObj, picID){
	//creates a promisse that will read the file and can be chained with its upload
	path = FileSystem.dataDirectory+"/Profiles/";
	return new Promise(function(resolve, reject){
		var base64 = picObj.base64.split(",");
		const r = iT.getImageFromBase64(base64[1]).then(function(image){
			return FileSystem.readBufferFromFile(image.path);
		},function(error){
			throw new Error("Imagem nao decodificada");
		}).then(function(buffer){
			return FileSystem.delete(path+picID+".jpg").then(function(r){
				return FileSystem.writeBufferToFile(path+picID+".jpg", buffer)	
			},function(e){
				return FileSystem.writeBufferToFile(path+picID+".jpg", buffer)
			});
		}).then(function(r){
			return true;
		},function(e){
			console.log("promiseSaveUsersUserProfilePictures: "+JSON.stringify(e.message));
			throw new Error("Image not saved" + picID+".jpg");
		});
		resolve(r);
	});
}	
////////////////////////////////////////////////////////////////////////////////////
function getGroupPicture(groupId){
	const r = FileSystem.exists(FileSystem.dataDirectory+"/Groups/"+groupId+".jpg").then(function(r){//
		var path = r ? FileSystem.dataDirectory+"/Groups/"+groupId+".jpg" : "Assets/Images/default_group.jpg";
		var obj = {};
		obj[groupId] = path
		return obj;
	}).catch(function(e){
		console.log("getGroupPicture: "+JSON.stringify(e));
		return null;
	});
	return r;
}

function saveGroupsPictures(groupsPics){
  path = FileSystem.dataDirectory+"/Groups/";
	const r = getUserGroupsInLdb().then(function(groups){
		for(id in groups){
    	if(!groupsPics.hasOwnProperty(id)){
				//deleting the group pictures of groups that no longer exists
				FileSystem.deleteSync(path+id+".jpg");
			}
		}
		var promises =[];
		for (var groupId in groupsPics){
			picObj = groupsPics[groupId];
			promises.push(promiseSavegroupPic(picObj, groupId));
		}
		return Promise.all(promises);
	}, function(e){
		console.log("ERRO de leitura do bd no salvar grupos");
	}).catch(function(e){
		console.log("saveGroupsPictures: "+JSON.stringify(e));
		console.log("saveGroupsPictures: "+JSON.stringify(e.message));
	});
	return r;
	
}

function promiseSavegroupPic(picObj, groupId){
	path = FileSystem.dataDirectory+"/Groups/";
	//creates a promisse that will read the file and can be chained with its upload
	return new Promise(function(resolve, reject){
		if(picObj == null){
			FileSystem.exists(path+groupId+".jpg").then(function(exists){
				resolve(exists ? FileSystem.delete(path) : null);
			});
		}else if(picObj != false){
			var base64 = picObj.base64.split(",");
			const r = iT.getImageFromBase64(base64[1]).then(function(image){
				return FileSystem.readBufferFromFile(image.path);
			},function(error){
				throw new Error("Imagem nao decodificada");
			}).then(function(buffer){
				return FileSystem.writeBufferToFile(path+groupId+".jpg", buffer).then(function(r){
					return true;
				},function(e){
					throw new Error("Imagem nao salva" + groupId+".jpg");
				});
			});
			resolve(r);
		}else{
			resolve(false);
		}
	});
}
////////////////////////////////////////////////////////////////////////////////////////
function saveActiveUserPostPictures(postPics){
	return new Promise(function(res, rej){
		try{
			path = FileSystem.dataDirectory+"/Photos/";
			var array =[];
			for (var picID in postPics){
				array.push({picID:picID, picObj: postPics[picID]});
			}
			array.reduce(function(curr,next){
				return curr.then(function(){
					return promiseSaveActiveUserPostPictures(next.picObj, next.picID)
				});

			}, Promise.resolve()).then(function(r){
				res(r);
			});
		}catch(e){
			console.log("saveActiveUserPostPictures: "+JSON.stringify(e.message));
			rej(e);
		}
	});
}

function promiseSaveActiveUserPostPictures(picObj, picID){
	//creates a promisse that will read the file and can be chained with its upload
	path = FileSystem.dataDirectory+"/Photos/";
	return new Promise(function(resolve, reject){
		var base64 = picObj.base64.split(",");
		const r = iT.getImageFromBase64(base64[1]).then(function(image){
			return FileSystem.readBufferFromFile(image.path);
		},function(error){
			throw new Error("Imagem nao decodificada");
		}).then(function(buffer){
			return FileSystem.delete(path+picID+".jpg").then(function(r){
				return FileSystem.writeBufferToFile(path+picID+".jpg", buffer)	
			},function(e){
				return FileSystem.writeBufferToFile(path+picID+".jpg", buffer)
			});
		}).then(function(r){
			return true;
		},function(e){
			reject(e);
			console.log("promessa active: "+JSON.stringify(e.message));
			throw new Error("Imagem nao salva" + picID+".jpg");
		});
		resolve(r);
	});
}
///////////////////////////////////////////////////////////////////////////////////////
function movePostPicture(picObj, id){
	path = FileSystem.dataDirectory+"/Photos/"+id+".jpg";
	const r = FileSystem.exists(path)
	.then(function(exists){
		if(exists){
			return FileSystem.delete(path);
		}else{
			return null;
		}
	}).then(function(r){
		return iT.getBufferFromImage(picObj);
	}).then(function(buffer){
		return FileSystem.writeBufferToFile(path, buffer);
	}).then(function(saved){
		picObj.path = path;
		return picObj;
	});
	return r;
	
}
///////////////////////////////////////////////////////////////////////////////////
function saveUserDataInLdb(userdata){

	const r = FileSystem.exists(FileSystem.dataDirectory+"/localdb").then(function(r){
		if(r){
			return FileSystem.readTextFromFile(FileSystem.dataDirectory+"/localdb").then(function(c){
				var data = JSON.parse(c);
				data.userData = userdata;
				return FileSystem.writeTextToFile(FileSystem.dataDirectory+"/localdb", JSON.stringify(data));
			});
		}else{
			return false;
		}
	}).catch(function(e){
		console.log("saveUserDataInLdb: "+JSON.stringify(e));
	});
	return r;
}

function getUserDataInLdb(){

	const r = FileSystem.exists(FileSystem.dataDirectory+"/localdb")
	.then(function(r){
		if(r){
			return FileSystem.readTextFromFile(FileSystem.dataDirectory+"/localdb").then(function(c){
				var data = JSON.parse(c);
				return data.userData;
			});
		}else{
			return false;
		}
	});
	return r;
}
////////////////////////////////////////////////////////////////////////
function saveUserGroupsInLdb(groups){

	const r = FileSystem.exists(FileSystem.dataDirectory+"/localdb")
	.then(function(r){
		if(r){
			return FileSystem.readTextFromFile(FileSystem.dataDirectory+"/localdb").then(function(c){
				var data = JSON.parse(c);
				data.groups = groups;
				return FileSystem.writeTextToFile(FileSystem.dataDirectory+"/localdb", JSON.stringify(data));
			});
		}else{
			return false;
		}
	});
	return r;
}

function getUserGroupsInLdb(){

	const r = FileSystem.exists(FileSystem.dataDirectory+"/localdb")
	.then(function(r){
		if(r){
			return FileSystem.readTextFromFile(FileSystem.dataDirectory+"/localdb").then(function(c){
				var data = JSON.parse(c);
				return data.groups;
			});
		}else{
			return false;
		}
	});
	return r;
}
///////////////////////////////////////////////////////////////////////////////////////
function getPhotosInLdb(section){
	//sections: profile, group or post
	const r = FileSystem.exists(FileSystem.dataDirectory+"/localdb")
	.then(function(r){
		if(r){
			return FileSystem.readTextFromFile(FileSystem.dataDirectory+"/localdb").then(function(c){
				var data = JSON.parse(c);
				return data.photos[section];
			});
		}else{
			return false;
		}
	}).catch(function(error){
		console.log("error: "+JSON.stringify(error));
		return null;
	});
	return r;
}

function savePhotosInLdb(section, photos){
	const r = FileSystem.exists(FileSystem.dataDirectory+"/localdb")
	.then(function(r){
		if(r){
			return FileSystem.readTextFromFile(FileSystem.dataDirectory+"/localdb").then(function(c){
				var data = JSON.parse(c);

				data.photos[section] == null ? data.photos[section] = {} : null;
				for(var index in photos){
					var writeItem = true;

					for (var id in data.photos[section]){
						photos[index].id == id ? writeItem = false : null; 
					}
					if(writeItem){
						data.photos[section][photos[index].id] = photos[index];
					}
				}
				return FileSystem.writeTextToFile(FileSystem.dataDirectory+"/localdb", JSON.stringify(data));
			});
		}else{
			return false;
		}
	}).catch(function(e){
		console.log("savePhotosInLdb:"+e.message);
		return false;
	});
	return r;
}
/////////////////////////////////////////////////////////////////////////////////////////////
function deleteNonExistingPostPicsFromLdb(){

	var path = FileSystem.dataDirectory+"/Photos/";
	var photos = null;

	const r = getPhotosInLdb("post").then(function(pt){
		photos = pt;
		if(Array.isArray(photos)){
			//this part intends to resolve a distortion where a 
			//no existing series of values where found in the post value of local db
			photos = {};
			return null;
		}else{
			var promises = [];
			d = new Date();
			now = d.getTime();

			for(var id in photos){
				var p = photos[id];
				if(p.user == us.userId()){
					promises.push(deleteImage(id));
				}else{
					var dp = new Date(p.time);
					var pTime = dp.getTime();
					if((now - pTime) > sysVars.timeOfPhotoInServerInMiliseconds){
						promises.push(deleteImage(id));
					}
				}
			}

			return Promise.all(promises);
		}
	}).then(function(returns){
		return FileSystem.readTextFromFile(FileSystem.dataDirectory+"/localdb");
	}).then(function(c){
		var data = JSON.parse(c);
		data.photos['post'] = photos;
		return FileSystem.writeTextToFile(FileSystem.dataDirectory+"/localdb", JSON.stringify(data));
	});
	return r;
}
function deleteImage(id){
	var path = FileSystem.dataDirectory+"/Photos/";
	FileSystem.exists(path+id+".jpg").then(function(exists){
		!exists ? delete photos[id] : null;
		!exists ? console.log("Imagem deletada: "+id) : null;
	});
}
////////////////////////////////////////////////////////////////////////////////

function savePostPictures(picObj,picID){
	const r = promiseSaveActiveUserPostPictures(picObj,picID).then(function(p){
		var resp = p ? FileSystem.dataDirectory+"/Photos/"+picID+".jpg" : p;
		return resp;
	});
	return r;
}

function updatePhotoInformation(section, photoData){
	//sections: profile, group or post
	const r = FileSystem.exists(FileSystem.dataDirectory+"/localdb")
	.then(function(r){
		if(r){
			return FileSystem.readTextFromFile(FileSystem.dataDirectory+"/localdb").then(function(c){
				var data = JSON.parse(c);
				photos = data.photos[section];
				for(var id in photos){

					if(id == photoData.id){
						photos[id] = photoData;
					}
				}

				data.photos[section] = photos;
				return FileSystem.writeTextToFile(FileSystem.dataDirectory+"/localdb", JSON.stringify(data)).then(function(r){
					return true;
				},function(e){
					throw new Error("DB not saved: "+e);
				});
			});
		}else{
			return false;
		}
	}).catch(function(error){
		console.log("error: "+JSON.stringify(error));
		return null;
	});
	return r;
}

module.exports = {
	fromServer : fromServer,
	getUserProfilePicture : getUserProfilePicture,
	saveProfilePicture : saveProfilePicture,
	saveUsersProfilePictures : saveUsersProfilePictures,
	getGroupPicture : getGroupPicture,
	getUserDataInLdb : getUserDataInLdb,
	saveUserDataInLdb : saveUserDataInLdb,
	getUserGroupsInLdb : getUserGroupsInLdb,
	saveUserGroupsInLdb : saveUserGroupsInLdb,
	getPhotosInLdb : getPhotosInLdb,
	savePhotosInLdb : savePhotosInLdb,
	movePostPicture : movePostPicture,
	savePostPictures : savePostPictures,
	updatePhotoInformation : updatePhotoInformation,
	getPostPicture : getPostPicture,
	saveActiveUserPostPictures : saveActiveUserPostPictures,
	saveGroupsPictures : saveGroupsPictures,
	deleteNonExistingPostPicsFromLdb : deleteNonExistingPostPicsFromLdb
}
