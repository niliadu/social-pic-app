var Observable = require("FuseJS/Observable");
var routerCalls = require("routerCalls");
var us = require("userStates");
var lud = require("JS/loadUserData.js");
var conn = require("JS/conexao.js");
var FileSystem = require("FuseJS/FileSystem");

var layoutID = Observable(1);

var groups = Observable();
getGroups();
setInterval(updateGroupsInformation, 30000);

var isUpdating = false;

function getGroups(){
	groupsData = [];
	posts = null;
	lud.getPhotosInLdb('post').then(function(p){
		posts = p;
		return lud.getUserGroupsInLdb();
	}).then(function(r){
		groupsData = r;
		var promissesGroup =[];
		for(var groupId in groupsData){
			promissesGroup.push(lud.getGroupPicture(groupId));
		}

		return promissesGroup.length > 0 ? Promise.all(promissesGroup) : null;
	}).then(function(r){

		if(r != null){
      		var picturesPaths = {};//arrange the paths in a easier way to retrieve
      		for(var index in r){
      			for(var gId in r[index]){
      				picturesPaths[gId] = r[index][gId];
      			}
      		}
      		groups.clear();
      		//populates de obseravable grupos
      		for(var groupId in groupsData){
        		//get the non seen pictures
        		var nonSeen = 0;
        		for(var pid in posts){
        			post = posts[pid];
        			(post.user != us.userId() && post.group == groupId && post.vis == false) ? nonSeen++ : null;
        		}
        		groupsData[groupId].nonSeen = nonSeen;
        		groupsData[groupId].img_path = picturesPaths[groupId];
        		groups.add(groupsData[groupId]);
        	}
        }
    });
}


function updateGroupsInformation(){
	if(!isUpdating){
		isUpdating = true;
		conn.json('groups/load.php',{
			item : "user_groups",
			uid: us.userId()
		}).then(function(r){
			return lud.saveUserGroupsInLdb(r.groups);
		}).then(function(saved){
			return lud.getUserGroupsInLdb();
		}).then(function(groups){
			var gplu ={};
			for(groupId in groups){
				var pe = FileSystem.existsSync(FileSystem.dataDirectory+"/Groups/"+groupId+".jpg");
				var lu = pe ?  groups[groupId].picture_last_update : false;
				gplu[groupId] = {picture_last_update : lu};
			}

			return conn.json("groups/load.php", {
				item : "groups_pics_update",
				id : us.userId(),
				groups_pic_last_update : gplu
			});
		}).then(function(groupsPics){
			if(groupsPics == null){
				return null;
			}else{
				return lud.saveGroupsPictures(groupsPics);
			}
		}).then(function(r){
			isUpdating = false;
			us.callNewInformationSaved();
		}).catch(function(e){
			isUpdating = false;
		});
	}
}

us.on("newInformationSaved", function(e){
	getGroups();
});

function goToGroupPage(e){
	routerCalls.send({
		router : "main",
		to:"group", 
		type : "push", 
		data : {id : e.data.id}
	});
}
module.exports = {
	layoutID : layoutID,
	goToGroupPage : goToGroupPage,
	groups : groups,
	updateGroupsInformation : updateGroupsInformation
}
