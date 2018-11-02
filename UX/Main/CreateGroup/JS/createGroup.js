var Observable = require("FuseJS/Observable");
var conn = require("JS/conexao.js");
var alert = require("alertPopup");
var cameraRoll = require("FuseJS/CameraRoll");
var lud = require("JS/loadUserData.js");
var iT = require("FuseJS/ImageTools");
var iF = require("JS/imageFunctions");
var us = require("userStates");
var routerCalls = require("routerCalls");


var groupname = Observable();
var infoSearch = Observable();
var selUsers = [];
var selectedUsers = Observable();
var searchResult = Observable();
var groupImagePath = Observable("Assets/Images/default_group.jpg");
var groupImage = null;

var iniW = 0;
var iniH = 0;
function choosePhoto()
{
  cameraRoll.getImage().then(function(image) {
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
    return iT.crop(image, options);
  }).then(function(same){
    return iT.resize(same, iF.optionsToResizeToMaxResolution(iniW,iniH, true));
  }).then(function(resized){
    groupImage = resized;
    groupImagePath.value = resized.path;
  });
}

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
    }).catch(function(e){
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

function create(){


  if(groupname.value == "" || groupname.value == null){
    alert.show("O nome do grupo não pode ficar em branco!");
  }else{

    var members = [];
    selectedUsers.forEach(function(user){
      members.push(user.id);
    });
    conn.photo("groups/add.php",{
      item : "new_group" ,
      creator : us.userId(),
      title : groupname.value,
      members : members,
      img : groupImage
    }).then(function(groupId){
      if(groupId == null){
        alert.show("Houve um problema com a criação do grupo! Por favor tente novamente.");
      }else{
        alert.show("Grupo criado com sucesso");
        routerCalls.send({
          router : "main",
          to:"mainView", 
          type : "go"
        });
      }
    }).catch(function(e){
      console.log(JSON.stringify(e));
      console.log(e.message);
    });
  }
}

module.exports = {
  groupname : groupname,
  infoSearch : infoSearch,
  choosePhoto : choosePhoto,
  selectedUsers : selectedUsers,
  addRemoveUser : addRemoveUser,
  searchResult : searchResult,
  searchUser : searchUser,
  groupImagePath : groupImagePath,
  create : create
}
