var Observable = require("FuseJS/Observable");
var conn = require("JS/conexao.js");
var md5 =  require("JS/md5.js");
var us = require("userStates");
var popup = require("alertPopup");
var loadUserData = require("JS/loadUserData.js");
var routerCalls = require("routerCalls");

var stayConnected = Observable();
var user = Observable("");
var pass = Observable("");

function toggleStayConnected() {
	stayConnected.value = !stayConnected.value;
}

function checkLogin(){

	conn.json('login/check.php',{
		item:'login_regular',
		user : user.value, 
		pass: md5(pass.value)
	}).then(function(r){
			var iL = (r == false || r == null) ? false : true;
			var uid = (r == false || r == null) ? "" : r.id;

		//saves the user data in the uno classa and app storage system
		us.userId(uid);
		us.userName(user.value);
		us.userPassword(md5(pass.value));

		!iL ? popup.show("Nome de usuário/email ou senha incorretos!") : null;
		if(iL){
			loadUserData.fromServer().then(function(r){
				us.isLogged(iL);
			});
		}
	});
}

function goToPasswordRecovery(){
	routerCalls.send({
		router : "main",
		to:"passwordRecovery", 
		type : "push", 
		data : {}
	});
}

function goToSignupForm(){
	routerCalls.send({
		router : "main",
		to:"signupForm", 
		type : "push", 
		data : {}
	});
}

module.exports = {
	stayConnected: stayConnected,
	toggleStayConnected: toggleStayConnected,
	checkLogin : checkLogin,
	userLogin : user,
	passLogin : pass,

	goToPasswordRecovery : goToPasswordRecovery,
	goToSignupForm : goToSignupForm
};
