var fs = require('fs');
var promisify = require('util').promisify;
var readFileA = promisify(fs.readFile);


var DataReader = function(){};

DataReader.readData = function(path, processing){
	if(!processing){
		processing = [];
	}
	var initialPromise = readFileA(path);
	return processing.reduce(function(acc, fn){
		return acc.then(fn);
	}, initialPromise);
};

module.exports = DataReader;

// var TBR1 = [JSON.parse, JSON.stringify].reduce(function(acc, fn){
// 	console.log(acc)
// 	return acc.then(fn);
// }, Promise.resolve("{\"1\":1}"));

// var TBR2 = [JSON.parse].reduce(function(acc, fn){
// 	console.log(acc)
// 	return acc.then(fn);
// }, Promise.resolve("{\"1\":1}"));

// var TBR3 = [].reduce(function(acc, fn){
// 	console.log(acc)
// 	return acc.then(fn);
// }, Promise.resolve("{\"1\":1}"));