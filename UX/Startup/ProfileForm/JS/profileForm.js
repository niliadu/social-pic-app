var Observable = require("FuseJS/Observable");
var conn =  require('JS/conexao.js');
var jsons = require("JS/jsons.js");
var us = require("userStates");
var popup = require("alertPopup");

var birthday = Observable("");
var lastBirthday;

var fullname = Observable("");
var city = Observable("");


function onBirthdayChange (arg) {
   var newBirthday = birthday.value;
   newBirthday = newBirthday.replace(/\//g, "");

   if (newBirthday == lastBirthday) return;
   lastBirthday = newBirthday;

   var day = "";
   var month = "";
   var year = "";

   if(newBirthday.length > 4) {
      year = newBirthday.substr(4);

      newBirthday = newBirthday.substr(0,4);
   }

   if (newBirthday.length > 2) {
      month = newBirthday.substr(2);
      if (month.length > 1) month += "/";

      newBirthday = newBirthday.substr(0,2);
   }

   day = newBirthday;
   if (day.length > 1) day += "/";

   birthday.value = day + month + year;

}

var hasGender = Observable(false);
var genderOptions = Observable({name:"Masculino", val: 1}, {name:"Feminino", val: 2});
var selectedGender = Observable({name: "Gênero", val:null});
selectedGender.onValueChanged(module, function (sel) {
  if (sel.val != null)
    hasGender.value = true;
});

var hasCountry = Observable(false);
var countryOptions = jsons.countries;
var selectedCountry = Observable({name : "País", val :null});
selectedCountry.onValueChanged(module, function (sel) {
  if (sel.val != null)
    hasCountry.value = true;
});

var state = Observable("");

function completaCadastro()
{
  var bS = birthday.value.split("/");
  var birthdayCorrected = bS[2] +"-"+bS[1]+"-"+bS[0];
  conn.json(
    'users/up.php',
    {
      item:'update_user_info',
      id : us.userId(),
      name    : fullname.value,
      birth : birthdayCorrected,
      gender  : selectedGender.value.val,
      country : selectedCountry.value.val,
      state   : state.value,
      city    : city.value
    }).then(r=>{

    var iL = r == true ? true : false;
    us.isLogged(iL);
    r !== true ? popup.show("Houve um erro na gravação de seus dados. Tente novamente ou pule esta etapa.") : us.isLogged(true);

    });

}

function jumpStep(){
  us.isLogged(true);
}


module.exports = {
   birthday: birthday,
   onBirthdayChange: onBirthdayChange,

   hasGender : hasGender,
   genderOptions : genderOptions,
   selectedGender : selectedGender,

   hasCountry : hasCountry,
   countryOptions : countryOptions,
   selectedCountry : selectedCountry,

   state : state,

   fullname : fullname,
   city : city,

   completaCadastro : completaCadastro,
   jumpStep : jumpStep
};
