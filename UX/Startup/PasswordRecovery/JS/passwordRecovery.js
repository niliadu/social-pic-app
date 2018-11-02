var Observable = require("FuseJS/Observable");
var conn = require("JS/conexao.js");
var alert = require("alertPopup");
var routerCalls = require("routerCalls");

var email = Observable("");

function sendRecEmail(){
	if(email.value == "" || email.value == null){
		alert.show("O email não pode ficar em branco!");
	}else{
		conn.json(
			'users/action.php',
			{item:'send_password_change_email', email : email.value}
			).then(function(r){
				alert.show("Foi enviado um email com instruções de mudança de senha para o endereço fornecido.");
				routerCalls.send({
					router : "main",
					type : "go",
					to:"back", 
					data : {}
				});
			});
		}
	}

	module.exports={
		email : email,
		sendRecEmail: sendRecEmail
	}