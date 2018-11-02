var conn =  require('JS/conexao.js');
var md5 =  require('JS/md5.js');
var Observable = require("FuseJS/Observable");
var us = require("userStates");
var routerCalls = require("routerCalls");

var itens = [];

var uname = Observable("");
var vUname = Observable("");
uname.vt = vUname;

var email = Observable("");
var vEmail = Observable("");
email.vt = vEmail;

var password = Observable("");
var vPassword = Observable("");
password.vt = vPassword;

var cpassword = Observable("");
var vCpassword = Observable("");
cpassword.vt = vCpassword;

itens.push(uname);
itens.push(email);
itens.push(password);
itens.push(cpassword);


function validateFields(obj)
{

	//erase the validation data
	itens.forEach(function(item)
	{
		item.vt.value = "";
	});


	//verify if the user na is available
	if(uname.value != "" && uname.value != null)
	{
		conn.json('users/check.php',
			{item:'username_av', username : uname.value}
			).then(function(r){
				!r ? vUname.value = "Este nome de usuário nao está disponível!":null;
			});
		}

	//verify id the email is available
	if(email.value != "" && email.value != null)
	{
		conn.json('users/check.php',
			{item:'email_used', email : email.value}
			).then(function(r){
				r ? vEmail.value = "Este email já está cadastrado com outro usuário!":null;
			});
		}


		if(password.value != "" && password.value != null){
			password.value.length < 6  ? vPassword.value = "A senha deve conter no mínimo 6 caracteres!":null;
		}

		if(cpassword.value != "" && cpassword.value != null){
			cpassword.value != password.value ? vCpassword.value = "As senhas inseridas não são iguais!":null;
		}

		itens.forEach(function(item){
			(item.value == "" || item.value == null)? item.vt.value = "Este campo não pode ficar em branco!":null;
		});

		var canSave = true;

		itens.forEach(function(item)
		{
			if(item.vt.value != "")
			{
				canSave = false;
			}
		});

		if (canSave)
		{
			conn.json(
				'users/add.php',
				{
					item:'newuser',
					uname : uname.value,
					password : md5(password.value),
					email : email.value
				}
				).then(function(r){
					us.userId(r.id);
					us.userName(uname.value);
					us.userPassword(md5(password.value));
					routerCalls.send({
						router : "main",
						type : "go",
						to:"profileForm", 
						data : {}
					});
				});

			}
		}
		module.exports = {
			uname : uname,
			vUname: vUname,
			email : email,
			vEmail : vEmail,
			password : password,
			vPassword : vPassword,
			cpassword: cpassword,
			vCpassword: vCpassword,
			validateFields : validateFields
		};
		