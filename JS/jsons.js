var Observable = require("FuseJS/Observable");
var countries = Observable(
	{val : 1, name : "Brasil"},
	{val : 2, name : "Argentina"}
);

module.exports = {
	countries : countries
} 
