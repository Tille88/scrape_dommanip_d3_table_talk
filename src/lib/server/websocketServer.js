var WebSocket = require('ws');
var DataReader = require('./datareader');
var MathUtils = require('../math');
var DateUtils = require('../date');
var serverInterface = require('./serverInterface');

// Constants (could use .env file... but want it to simply run for everyone)
// var FILE_PATH = '/../../../scraping/03_clean_data_json/billboard_top_10_1990_2000.json';
var FILE_PATH = '/../../../scraping/03_clean_data_json/billboard_top_10_1990.json';
var PORT = process.env.PORT || 8080;

// Have priv
// Have config as part of priv...

// Constructor
var WebsocketServer = function(opts={}){
	this.server = null;
	this.dataProm = null;
	this.intervalHandles = [];
	this.interval = opts.interval || 2000;
	this.currDate = null;
	this.dataProm = DataReader.readData(`${__dirname}${FILE_PATH}`, [
		JSON.parse,
		this.timeObjectToMap.bind(this)
	]);
	console.log(this.dataProm.then((data) => {
		console.log(data);
	}));

	this.start.call(this);
	// console.log('started');
};

WebsocketServer.prototype = Object.create(serverInterface);
// Mixins?
// Object.assign(WebsocketServer.prototype, x.prototype);
WebsocketServer.prototype.constructor = WebsocketServer;


WebsocketServer.prototype.start = function(){
	this.server = new WebSocket.Server({ port: PORT })
	this.server.on('connection', onConnection.bind(this));
};

var onConnection = function connection(ws) {
	// Using scope created for each connection...
	var lastDataIdx = 0;
	console.log("clients", this.server.clients.size);
	this.dataProm.then(() => {
		// CANT HAVE MULTIPLE HANDLES...
		var intervalHandle = setInterval(() => {
			console.log(this.dataKeys, this.dataKeys[lastDataIdx]);
			ws.send(JSON.stringify(this.dataMap.get(this.dataKeys[lastDataIdx++])));
			lastDataIdx = lastDataIdx > this.dataKeys.length-1 ? 0 : lastDataIdx;
		}, this.interval);
		this.intervalHandles.push(intervalHandle);
	}).catch((e) => console.error(e));

	ws.on('close', function(ws){
		console.log("clients: ", this.server.clients.size);
	});
};

WebsocketServer.prototype.stop = function(){
	this.intervalHandles.forEach(function(handle){
		clearInterval(handle);
	});
	this.intervalHandles = [];
	this.server.close(() => {
		// Hopefully covers listeners as well...
		console.log("server closed and cleanup of clients etc. is automatic");
	});
	this.server = null;
};

WebsocketServer.prototype.timeObjectToMap = function(obj){
	this.dataKeys = Object.keys(obj).sort(function(a, b){
		return DateUtils.isAfter(a, b);
	});
	this.dataMap = new Map(this.dataKeys.map(k => [k, obj[k]]));
	return true;
};

module.exports = WebsocketServer;

// var exampleSocket = new WebSocket("ws:localhost:8080");
// exampleSocket.send("test");
// exampleSocket.onmessage = function (event) {
//   console.log(event.data);
// }
// exampleSocket.close();



// new WebSocket("ws:localhost:8080").onmessage = function (event) {
// 	  console.log(event.data);
// 	}