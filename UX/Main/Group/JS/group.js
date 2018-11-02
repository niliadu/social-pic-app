var Observable = require("FuseJS/Observable");
var conn = require("JS/conexao.js");
var lud = require("JS/loadUserData.js");
var constants = require ("JS/constants");
var icons = constants.icons;
var routerCalls = require("routerCalls");
var sysVars = require("JS/systemVars.js");
var FileSystem = require("FuseJS/FileSystem");
var us = require("userStates");
var alert = require("alertPopup");

var group;
var groupName = Observable();
var groupMembers = Observable();
var userMostRecentPhoto = {};
var groupData = null;
var localPhotos = null;

this.Parameter.onValueChanged(module,function(param) {
	groupId = param.id;

	analyseGroupData(groupId).then(function(groupData){
		return updateGroupData(groupData);
	}).then(function(r){
		analyseGroupData(groupId);
	});

});


function analyseGroupData(groupId){

	const r = lud.getUserGroupsInLdb().then(function(groups){
		for(var gId in groups){
			gId == groupId ? groupData = groups[gId] : null;
		}

		groupName.value = groupData.title;

		groupMembers.clear();
		userMostRecentPhoto = {};
		var promises = [];
		groupData.members.forEach(function(memberData){

			promises.push(lud.getUserProfilePicture(memberData.id).then(function(path){
				if(memberData.nick == "" || memberData.nick == null){
					var name = "@"+memberData.uName;
				}else{
					var name = memberData.nick +" - @"+memberData.uName;
				}




				groupMembers.add({id: memberData.id, name : name, photo : path});
				userMostRecentPhoto[memberData.id] = null;
			}));

		});
		return Promise.all(promises);
	}).then(function(returns){
		//get all posted pictures stored in the device
		return lud.getPhotosInLdb('post');
	}).then(function(photos){

		//get the timestamp of the most recent photo in the group of each user
		for(var id in photos){
			if(photos[id].group == groupId){
				var dateString = new Date(photos[id].time);
				var timeStamp = dateString.getTime();

				if(photos[id].user in userMostRecentPhoto){
					if(userMostRecentPhoto[photos[id].user] == null){
						userMostRecentPhoto[photos[id].user] = timeStamp;
					}else if(userMostRecentPhoto[photos[id].user] < timeStamp){
						userMostRecentPhoto[photos[id].user] = timeStamp;
					}
				}


			}
		}
		//turns the arrays if objects in a array of arrays
		var sortable = [];
		for (var i in userMostRecentPhoto) {
			sortable.push([i, userMostRecentPhoto[i]]);
		}
		
		//sorts the new arrray leaving the null value in last place
		sortable.sort(function(a, b){
			if(a[1] === null){
				return 1;
			}else if(b[1] === null){
				return -1;
			}else{
				return a[1] < b[1] ? 1 : -1;
			}
		});
		
		newGroupsMembers = [];//temporary array
		//reorders the members in the temporary array 
		sortable.forEach(function(item){
			groupMembers.forEach(function(val){
				if(val.id == item[0]){
					if(val.id != us.userId()){
						var nonSeen = 0;
						for(pid in photos){
							p = photos[pid];
							(p.user == val.id && p.group == groupId && p.vis == false) ? nonSeen++ : null;
						}

						if(nonSeen != 0){
							val.name += " - "+nonSeen+" novas fotos";
						}
					}
					newGroupsMembers.push(val);
				}
			});
		});
		//replaces the observable for the new ordered members
		groupMembers.replaceAll(newGroupsMembers);

		return groupData;
	});
	return r;
}

function updateGroupData(groupData){
	var groupPicLastUpdate = groupData.picture_last_update;
	var membersCheck = {};
	var activePosts = [];

	var response = null;
	var path = FileSystem.dataDirectory+"/Profiles/";

	groupData.members.forEach(function(item){
		membersCheck[item.id] = !FileSystem.existsSync(path+item.id+".jpg") ? false : item.profile_pic_last_update;
	});
	
	const r = lud.getPhotosInLdb('post').then(function(photos){
		for(var id in photos){
			if(photos[id].group == groupData.id){
				
				var dateString = new Date(photos[id].time);
				var timeStamp = dateString.getTime();
				var now = new Date();
				var nowTimestamp = now.getTime();

				if(nowTimestamp - sysVars.timeOfPhotoInServerInMiliseconds < timeStamp){
			 		//get the photos that are in the server
			 		activePosts.push(id);
			 	}
			 }
			}
			return conn.json("groups/load.php",{
				item : "group_data_update",
				id : groupData.id,
				group_pic_last_update : groupPicLastUpdate,
				members : membersCheck,
				activePosts : activePosts
			});
		}).then(function(res){
			response = res;
			if(response == null || response == false){
				return null
			}

			//delete in the localdb the members of the group that were deleted from the group on the server
			groupData.members.forEach(function(item, index){
				response.userToDelete.indexOf(item.id) !== -1 ? groupData.members.splice(index,1) : null;
			});

			//insert in the localdb the members of the group that were inserted in the group on the server
			response.userToInsert.forEach(function(item){
				var insert = true;
				groupData.members.forEach(function(member){
					if(member.id == item.id){
						insert = false;
					}
				});

				insert ? groupData.members.push(item) : null;
			});

			if(response.groupPicLastUpdate == false){
				return null;
			}else{
				return lud.promiseSavegroupPic(response.groupPic, groupData.id)
			}
		}).then(function(picSaved){
			if(response == null || response == false){
				return null
			}
			picSaved ? groupData.picture_last_update = response.groupPicLastUpdate : null;
			
			return lud.saveUsersProfilePictures(response.userPics);
		}).then(function(picsSaved){
			if(response == null || response == false){
				return null
			}
			return lud.savePhotosInLdb('post', response.newPosts);
		}).then(function(postsSaved){
			if(response == null || response == false){
				return null
			}
			return lud.getUserGroupsInLdb();
		}).then(function(groups){
			if(response == null || response == false){
				return null
			}
			for(var gid in groups){
				gid == groupData.id ? groups[gid] = groupData : null;
			}
			return lud.saveUserGroupsInLdb(groups);
		}).catch(function(e){
			console.log("ERRO: "+JSON.stringify(e));
			console.log("ERRO: "+JSON.stringify(e.message));
		});

		return r;
	}

	var groupTabs = [{
		title : "Novidades",
		id : "feed",
		icon : icons.news,
	},{
		title : "Membros",
		id : "members",
		icon : icons.users,
	}]
	var currentTab = Observable("members");

	var groupMenuOptions = Observable(
		{name:"Gerenciar Grupo", val: 1},
		{name:"Sair do Grupo", val: 2});

	var groupSelectedOption = Observable();
	groupSelectedOption.onValueChanged(module, function(value){

		switch(value){
			case 1 :
			pushToGroupConfig();
			break;
			case 2:
			leaveGroup();
			break;
			case 3:
			console.log("case 3" + value);
			break;
			case 4:
			console.log("case 4" + value);
			break;
			case 5:
			console.log("case 5" + value);
			break;
			case 6:
			console.log("case 6" + value);
			break;
			case 7:
			console.log("case 7" + value);
			break;
		}
	});



	function pushToGroupConfig(e){
		routerCalls.send({
			router : "main",
			to:"groupConfig", 
			type : "push", 
			data : {groupId : groupId}
		});
	}

	function pushToProfile(e){
		routerCalls.send({
			router : "main",
			to:"profile", 
			type : "push", 
			data : {userInfo : e.data, groupId : groupId}
		});
	}

	function pushToPostPhoto(e){
		routerCalls.send({
			router : "main",
			to:"postPhoto", 
			type : "push", 
			data : {groupId : groupId, takePic : true}
		});
	}

	function pushToPostPhotoGallery(e){
		routerCalls.send({
			router : "main",
			to:"postPhoto", 
			type : "push", 
			data : {groupId : groupId, takePic : false}
		});
	}

	function leaveGroup(){
		conn.json("groups/del.php",{
			item : "members",
			groupId : groupId,
			members : [us.userId()]
		}).then(function(r){
			if(r == null || r == false){
				alert.show("Houve um problema ao sair do grupo! Por favor tente novamente.");
			}else{
				alert.show("Você saiu do grupo "+groupName.value+".");
				routerCalls.send({
					router : "main",
					to:"mainView", 
					type : "go"
				});
			}
		});
	}
	module.exports = {
		localPhotos : localPhotos,
		groupName : groupName,
		groupMembers : groupMembers,

		groupTabs : groupTabs,
		currentTab : currentTab,

		groupMenuOptions : groupMenuOptions,
		groupSelectedOption : groupSelectedOption,

		pushToProfile : pushToProfile,
		pushToPostPhoto : pushToPostPhoto,
		pushToPostPhotoGallery:pushToPostPhotoGallery,
		icon : icons.addPhoto,
		
	}
