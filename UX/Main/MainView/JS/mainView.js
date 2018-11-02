var Observable = require("FuseJS/Observable");
var us = require("userStates");
var lud = require("JS/loadUserData.js");
var constants = require("JS/constants");
var routerCalls = require("routerCalls");
var conn = require("JS/conexao.js");
var FileSystem = require("FuseJS/FileSystem");

var icons = constants.icons;
var isOpen = Observable(false);
var viewOptions = [
{
  title : "Novidades",
  id : "news",
  icon : icons.news,
},{
  title : "Grupos",
  id : "groups",
  icon : icons.group,
},{
  title : "Amigos",
  id : "friends",
  icon : icons.users,
}];
var currentView = Observable("groups");


function toggleMenu (){ isOpen.value = !isOpen.value; }

currentView.onValueChanged (module, function (value) {
  mainViewRouter.goto(value);
});

var userPic = Observable();
lud.getUserProfilePicture(us.userId()).then(function(r){
  userPic.value = r;
});

function updateUserProfilePicture(){
  lud.getUserDataInLdb().then(function(userData){

    var pplu = null;
    if(userData != false && typeof userData !== "undefined"){
      //gets the last update from the profile pictue 
      //to only download the new pictute if necessary
      pplu = userData.profile_pic_last_update;
    }
    return conn.json("photos/load.php",{
      item : "update_user_profile_pic",
      id : us.userId(),
      profile_pic_last_update : pplu
    });
  }).then(function(userP){
    return saveProfilePicture(userP, us.userId());
  }).then(function(saved){
    return lud.getUserProfilePicture(us.userId());
  }).then(function(path){
    userPic.value = r;
  });
}

var userNick = Observable(us.userName());
lud.getUserDataInLdb().then(function(r){
  (r !=false && r != null) ? userNick.value = r.nick:null;
});//


module.exports = {
  userPic : userPic,
  userNick : userNick,

  isOpen : isOpen,
  toggleMenu : toggleMenu,

  viewOptions : viewOptions,
  currentView : currentView
}
