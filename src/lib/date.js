var moment = require('moment');

var DateUtils = function(){};

DateUtils.parse = function(dateString){
	return moment(dateString);//.isAfter();
};

DateUtils.isAfter = function(dateString, comparisonDateString){
	return moment(dateString).isAfter(comparisonDateString);
};

module.exports = DateUtils;