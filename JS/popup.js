var Observable = require("FuseJS/Observable");

var popupTexto = Observable("");
var popupVisibility = Observable(false);

function show (e){
	popupTexto.value =  e.text;
	popupVisibility.value = true;
	var time = e.timer == null ? 4000 : e.timer;
	setTimeout(function(){ hide(); }, time);
}

function hide(){
	popupTexto.value = "";
	popupVisibility.value = false;
}


module.exports = {
	popupTexto : popupTexto,
	popupVisibility : popupVisibility,
	showPopup: show,
}
