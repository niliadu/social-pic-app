var Observable = require('FuseJS/Observable');
var conn = require("JS/conexao.js");
var routerCalls = require("routerCalls");
var alert = require("alertPopup");
var lud = require("JS/loadUserData.js");
var iF = require("JS/imageFunctions");
var us = require("userStates");

var searchResult = Observable();
var selectedUsers = Observable();
var selUsers = [];
var infoSearch = Observable();


var addBtn = require("addButton");

var group;
var groupName = Observable();
var groupMembers = Observable();
var userAll = Observable();
var groupData = null;
var localPhotos = null;
var groupId;
var groupImagePath = Observable("Assets/Images/default_group.jpg");

addBtn.set(false);


this.Parameter.onValueChanged(module,function(param) {
  groupId = param.groupId;

  lud.getUserGroupsInLdb().then(function(grupos){
    for(var index in grupos){
     if(index == groupId){
      groupData = grupos[index];
    }
  }
	  	//console.log(JSON.stringfy(groupData));
	  	groupName.value = groupData.title;
	  	//console.log(JSON.stringify(groupData));
	  	groupMembers = groupData.members;
	  	//console.log(JSON.stringify(groupMembers));

      groupMembers.forEach(function(member){
       if(member.id != us.userId()){
         lud.getUserProfilePicture(member.id).then(function(path){
          if(member.nick == "" || member.nick == null){
           var name = "@"+member.uName;
         }else{
           var name = member.nick+"- @"+member.uName;
         }
         addRemoveUser({data:{id: member.id, name:name, photo: path}});
				//console.log(JSON.stringify(selectedUsers));
			});
       }
     }); 

    });

});


var searching = false;
function searchUser(e) {
 if(infoSearch.value != "" && infoSearch.value != null && searching === false) {
  searchResult.clear();
  searching = true;
  conn.json (
    'users/load.php', {
      item:'users_uname_search',
      info : infoSearch.value
    }).then(function(r){
      r.users.forEach(function(user){
        if(user.id != us.userId()){// do not add the creator of the group  in the search list
          if(user.nick == "" || user.nick == null){
            var name = "@"+user.uName;
          }else{
            var name = user.nick +"- @"+user.uName;
          }

          searchResult.add({id: user.id, name:name, photo: user.userPic});
        }
      });
      searching = false;
    });
  } else if (infoSearch.value == "") {
    searchResult.clear();
  }
}


function addRemoveUser(user)
{
  var index = selUsers.indexOf(user.data);
  index == -1 ? selUsers.push(user.data) : selUsers.splice(index,1);

  selectedUsers.replaceAll(selUsers);
}


function save(){

  var members = [];
  selectedUsers.forEach(function(user){
    members.push(user.id);
  });
  members.push(us.userId());
  conn.json("groups/up.php",{
    item : "members" ,
    id :  groupId,
    members : members
  }).then(function(r){
    if(groupId == false){
      alert.show("Houve um problema com a Alteração! Por favor tente novamente.");
    }else{
      alert.show("Alteração realizada com sucesso");
      routerCalls.send({
        router : "main",
        to:"back", 
        type : "go", 
      });
    }
  });
}



module.exports = {

  groupName : groupName,
  infoSearch : infoSearch,
  selectedUsers : selectedUsers,
  searchResult : searchResult,
  searchUser : searchUser,
  addRemoveUser : addRemoveUser,
  save : save 
}