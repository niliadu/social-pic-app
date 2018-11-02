var sysVars = require("JS/systemVars");
var iF = require("JS/imageFunctions.js");

function json(url,postData){
	const r = fetch(
		sysVars.baseUrlWS + url,
		{
			method: 'POST',
			headers: { "Content-type": "application/json"},
			body: JSON.stringify(postData)
		})
	.then(function(response) {
		if(response.ok){
			try{
				JSON.parse(response['_bodyInit']);
						return response.json();    // This returns a promise
					}catch(e){

						throw new Error("Problema com o servidor PHP conteudo retornado => "+response['_bodyInit']);
					}
				}
				throw new Error("Problema com a conexao ao servidor. ERRO => " + response.status +" - "+response.statusText);
			}).then(function(responseObject) {

				if(responseObject.error){
					throw new Error("Problema com o servidor SQL. Erro => "+responseObject.desc);
				}else{
					return responseObject.ans;
				}
			}).catch(function(error) {
				console.log("connJSON: "+error.message);
				return null;
			});
			return r;
		}
//

function photo(url,postData){
	const r1 = iF.imageObjToBase64(postData.img).then(function(i64){
		console.log("dentro photo");
		postData.img = {base64:i64};
		return json(url,postData);
	}).catch(function(e){
		console.log("photo Conversion:"+ e.message +"/"+JSON.stringify(e));
	});
	return r1;
}
module.exports = {
	json: json,
	photo: photo
};