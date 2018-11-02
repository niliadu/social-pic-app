console.log("mainrouter.js");

var Observable = require("FuseJS/Observable");
var us = require("userStates");
var constants = require("JS/constants");
var icons = constants.icons;
var routerCalls = require("routerCalls");


routerCalls.setMainRouter(mainRouter);

var mainOptions = Observable(
	{name:"Perfil", id: 1, icon: icons.user, color: "#F77158"},
	{name:"Notificações", id: 2, icon: icons.alerts, color: "#F77158"},
	{name:"Configurações", id: 3, icon: icons.config, color: "#F77158"},
	{name:"Sobre", id: 4, icon: icons.about, color: "#F77158"},

	{name:"div", id: 0, icon: '', color: ""},

	{name:"Limpar Fotos", id: 6, icon: icons.erase, color: "#F99A53"},
	{name:"Sair", id: 7, icon: icons.logout, color: "#F99A53"}
	);

var selectedOption = Observable();
selectedOption.onValueChanged(module, function(value){
	switch(value){
		case 1 :
		goToProfile();
		break;
		case 2:
		break;
		case 3:
		goToConfig();
		break;
		case 4:
		goToAbout();
		break;
		case 5:
		break;
		case 6:
		break;
		case 7:
		us.isLogged(false);
		break;
	}
});

function goToAbout () {
	mainRouter.push("about");
}

function goToConfig () {
	mainRouter.push("config");
}

function goToCreateGroup () {
	mainRouter.push("createGroup");
}


//////////////////////////////////////////
var currentGroup;
function goToGroup(group){
	mainRouter.goto("group", group);
	currentGroup = group;
}
function pushGroup(group){
	mainRouter.push("group", group);
	currentGroup = group;
}
////////////////////////////////////////////
function goToMain (){
	mainRouter.goto("mainView");
}

function goToPostPhoto(){
	mainRouter.push("postPhoto", {groupId : currentGroup.data.id});
}

function goToProfile () {
	mainRouter.push("profile", {userInfo : {id:us.userId()}, flagProfile: 'self'});
}

function goBack () {
	mainRouter.goBack();
}


routerCalls.on('call', function(e){
	var call = e[0];
	if(call.router == 'main'){
		if(call.type == 'go'){
			switch(call.to){
				case "back":
				goBack();
				break;
				case 'group':
				goToGroup(call.data);
				break;
				case 'login':
				mainRouter.goto("login");
				break;
				case "profileForm":
				mainRouter.goto("profileForm");
				break;
				case "var":
				mainRouter.goto(call.data.val);
				break;
				case "mainView":
				goToMain();
				break;
			}
		}else if(call.type == 'push'){
			switch(call.to){
				case 'passwordRecovery':
				mainRouter.push("passwordRecovery");
				break;
				case 'signupForm':
				mainRouter.push("signupForm");
				break;
				case 'group':
				pushGroup(call.data);
				break;
				case 'profile':
				mainRouter.push("profile", {
					userInfo : call.data.userInfo,
					flagProfile: 'group',
					groupId : call.data.groupId
				});
				break;
				case 'postPhoto':
				mainRouter.push("postPhoto", {
					groupId : call.data.groupId,
					takePic : call.data.takePic
				});
				break;
				case 'photoScore':
				mainRouter.push("photoScore", {
					id : call.data.id
				});
				break;
				case 'groupConfig':
				mainRouter.push("groupConfig", {
					groupId : call.data.groupId
				});
				break;
			}
		}
	}
});
module.exports = {
	mainOptions : mainOptions,
	selectedOption : selectedOption,

	goToCreateGroup : goToCreateGroup,
	goToGroup : goToGroup,
	goToMain : goToMain,

	//goToPostPhoto : goToPostPhoto,
	goToProfile : goToProfile,
	goBack : goBack
}
