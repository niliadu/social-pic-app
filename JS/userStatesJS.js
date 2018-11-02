var Observable = require("FuseJS/Observable");
var us = require("userStates");
var FileSystem = require("FuseJS/FileSystem");

var hideSplash = Observable(us.hideSplash());
var isLogged = Observable(us.isLogged());
var userId = Observable(us.userId());
var userName = Observable(us.userName());
var userPassword = Observable(us.userPassword());

us.on("isLoggedChange", function(value){
	isLogged.value = value;
	us.saveUserData();
});

us.on("hideSplashChange", function(value){
	hideSplash.value = value;
});

us.on("userIdChange", function(value){
	userId.value = value;
	us.saveUserData();
	FileSystem.readTextFromFile(FileSystem.dataDirectory+"/localdb").then(function(content) {
     	var data = JSON.parse(content);
    	data.userId = value;
    	FileSystem.writeTextToFile(FileSystem.dataDirectory + "/localdb", JSON.stringify(data));
	}, function(error) {console.log(error.message);});
});

us.on("userNameChange", function(value){
	userName.value = value;
	us.saveUserData();
});

us.on("userPasswordChange", function(value){
	userPassword.value = value;
	us.saveUserData();
});

us.on("saveUserDataEvent", function(iL,uid, uname, pass){
	FileSystem.readTextFromFile(FileSystem.dataDirectory+"/access").then(function(content) {
     	var data = JSON.parse(content);
    	data.isLogged = iL;
    	data.userId = uid;
    	data.userName = uname;
    	data.userPassword = pass;
    	FileSystem.writeTextToFile(FileSystem.dataDirectory + "/access", JSON.stringify(data));
	}, function(error) {console.log(error.message);});
});

function changeLoggedState(e){
	us.isLogged(e.val);
	us.saveUserData();
}

module.exports = {
	hideSplash : hideSplash,
	isLogged : isLogged,
	userId : userId,
	userName : userName,
	userPassword : userPassword,

	changeLoggedState : changeLoggedState,

	forceLogin : function () { isLogged.value = true; }
}
