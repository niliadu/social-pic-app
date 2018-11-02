

var iT = require("FuseJS/ImageTools");
var FileSystem = require("FuseJS/FileSystem");
var us = require("userStates");
var conn = require("JS/conexao.js");
var loadUserData = require("JS/loadUserData.js");
var routerCalls = require("routerCalls");

iT.getImageFromBase64("");//makes the user give permition to acces the cell right in the start of the aplication

//create the folder structure of the app///////////////////////////
FileSystem.listDirectories(FileSystem.dataDirectory).then(function(list){
	list.indexOf(FileSystem.dataDirectory+"/Profiles") === -1 ?FileSystem.createDirectory(FileSystem.dataDirectory+"/Profiles"):null;
	list.indexOf(FileSystem.dataDirectory+"/Groups") === -1 ?FileSystem.createDirectory(FileSystem.dataDirectory+"/Groups"):null;
	list.indexOf(FileSystem.dataDirectory+"/Photos") === -1 ?FileSystem.createDirectory(FileSystem.dataDirectory+"/Photos"):null;//
});
// FileSystem.listEntries(FileSystem.dataDirectory+"/Photos").then(list=>{
// 	console.log(JSON.stringify("lista1:"+list));
// });
// var data = {userId:null, groups:null, photos:{profile:null,group:null, post:null}};
// FileSystem.writeTextToFile(FileSystem.dataDirectory + "/localdb", JSON.stringify(data));

FileSystem.exists(FileSystem.dataDirectory+"/access")
.then(function(r){
	var data = {isLogged:null,userId:null,userPassword:null,userName:null};
	return !r ? FileSystem.writeTextToFile(FileSystem.dataDirectory + "/access", JSON.stringify(data)):null;
}).then(function(r){
	return FileSystem.exists(FileSystem.dataDirectory+"/notifications");
}).then(function(r){
	return !r ? FileSystem.writeTextToFile(FileSystem.dataDirectory + "/notifications", ""):null;
}).then(function(r){
	return FileSystem.exists(FileSystem.dataDirectory+"/localdb");
}).then(function(r){
	var data = {userId:null, groups:null, photos:{profile:{},group:{}, post:{}}};
	return !r ? FileSystem.writeTextToFile(FileSystem.dataDirectory + "/localdb", JSON.stringify(data)):null;
}).then(function(r){
	return FileSystem.readTextFromFile(FileSystem.dataDirectory+"/access");
}).then(function(content) {
//checks if the user is logged and if the credentials stored are still valid
var data = JSON.parse(content);
if(data.isLogged){
	
	conn.json(
		'login/check.php',
		{
			item:'login_regular',
			user : data.userName,
			pass : data.userPassword
		}).then(function(r){
			if(r == false || r == null){
				us.isLogged(false);
				routerCalls.send({
					router : "main",
					to:"login", 
					type : "go", 
					data : {}
				});

			}else{
				us.userId(r.id);
				us.userName(data.userName);
				us.userPassword(data.userPassword);
	    		//will get the user data stored in the server
	    		return loadUserData.fromServer().then(function(r){
	    			// FileSystem.listEntries(FileSystem.dataDirectory+"/Photos").then(list=>{
	    			// 	console.log("lista2:"+JSON.stringify(list));
	    			// });
	    			us.hideSplash(true);
	    			if(r != null && r != false){
	    				us.isLogged(true);
	    			}else{
	    				routerCalls.send({
	    					router : "main",
	    					to:"login", 
	    					type : "go", 
	    					data : {}
	    				});
	    			}
	    		});
	    	}
	    });
	}else{
		us.hideSplash(true);
		routerCalls.send({
			router : "main",
			to:"login", 
			type : "go", 
			data : {}
		});
	}
}).catch(function(error){
	console.log(JSON.stringify(error.message));
});
//////////////////////////////////////////////////////////////////////////////////////
