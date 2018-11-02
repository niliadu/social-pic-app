var Observable = require("FuseJS/Observable");
var addBtn = require("addButton").set(false);

// General Options
var usePrivacy = Observable(false);
usePrivacy.onValueChanged (module, function(value){
  // console.log("usePrivacy: " + value);
});

var automaticDownloads = Observable(true);
automaticDownloads.onValueChanged (module, function(value){
  // console.log("automaticDownloads: " + value);
});

var commentsHighlights = Observable(true);
commentsHighlights.onValueChanged (module, function(value){
  // console.log("commentsHighlights: " + value);
});

// Alerts Options
var useAlerts = Observable(true);
useAlerts.onValueChanged (module, function(value){
  // console.log("useAlerts: " + value);
});

var useVibratingAlerts = Observable(false);
useVibratingAlerts.onValueChanged (module, function(value){
  // console.log("useVibratingAlerts: " + value);
});

var useSoundAlerts = Observable(true);
useSoundAlerts.onValueChanged (module, function(value){
  // console.log("useSoundAlerts: " + value);
});

var hasSound = Observable(false);
var soundOptions = Observable({name:"Som 1", val: 1}, {name:"Som 2", val: 2}, {name:"Som 3", val: 3}, {name:"Som 4", val: 4}, {name:"Som 5", val: 5});
var selectedSound = Observable({name:"Som 1", val: 1});
selectedSound.onValueChanged(module, function (sel) {
  if (sel.val != null)
    hasSound.value = true;
});

var useVisualAlerts = Observable(false);
useVisualAlerts.onValueChanged (module, function(value){
  // console.log("useVisualAlerts: " + value);
});

var hasVisual = Observable(false);
var visualOptions = Observable({name:"Em Cima", val: 1}, {name:"Embaixo", val: 2});
var selectedVisual = Observable({name:"Em Cima", val: 1});
selectedVisual.onValueChanged(module, function (sel) {
  if (sel.val != null)
    hasVisual.value = true;
});

module.exports = {
  usePrivacy : usePrivacy,
  automaticDownloads : automaticDownloads,
  commentsHighlights : commentsHighlights,

  useAlerts : useAlerts,
  useVibratingAlerts : useVibratingAlerts,
  useSoundAlerts : useSoundAlerts,
  useVisualAlerts : useVisualAlerts,

  hasSound : hasSound,
  soundOptions : soundOptions,
  selectedSound : selectedSound,

  hasVisual : hasVisual,
  visualOptions : visualOptions,
  selectedVisual : selectedVisual,
}
