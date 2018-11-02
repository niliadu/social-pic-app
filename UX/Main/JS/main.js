var Observable = require("FuseJS/Observable");
var us = require("userStates");
var conn = require("JS/conexao.js");
var lud = require("JS/loadUserData.js");
var sysVars = require("JS/systemVars.js");
var LocalNotify = require("FuseJS/LocalNotifications");

LocalNotify.on("receivedMessage", function(payload) {
	console.log("Received Local Notification: " + payload);
	LocalNotify.clearAllNotifications();
});

var isChecking = false;
//Creates notifications when there is new posts
function checkNewPosts(){
	
	var callNotification = false;
	if(!isChecking){
		isChecking = true;
		lud.getPhotosInLdb("post").then(function(photos){
			d = new Date();
			now = d.getTime();
			var active = [];
			for(var pid in photos){
				var dp = new Date(photos[pid].time);
				var pTime = dp.getTime();

				if((now - pTime) < sysVars.timeOfPhotoInServerInMiliseconds){
					active.push(pid);
				}
			}

			return conn.json("photos/load.php",{
				item : "get_new_posts",
				id : us.userId(),
				local_active_posts : active
			});
		}).then(function(photos){
			if(photos.length > 0){
				lud.savePhotosInLdb('post',photos).then(function(saved){
					us.callNewInformationSaved();
					isChecking = false;
					return lud.getPhotosInLdb('post');
				}).then(function(localPhotos){
					noonSeen = 0;
					for(var id in localPhotos){
						var p = localPhotos[id];
						(p.vis == false && p.user != us.userId()) ? noonSeen++ : null;
					}
					if(noonSeen > 0){
						LocalNotify.now("Novas fotos!", "Você tem "+noonSeen+" novas fotos em seus grupos! ", "payload", true);
					}
					isChecking = false;
				},function(e){
					isChecking = false;
				});
			}else{
				isChecking = false;
			}
			isChecking = false;
		},function(e){
			isChecking = false;
		});
	}
}

setInterval(checkNewPosts, 30000);

module.exports = {
};
