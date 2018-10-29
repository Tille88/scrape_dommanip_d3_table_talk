var servers = {};
servers.WebsocketServer = require("./websocketServer.js");
// servers.mockServer = {};

var ServerFact = function(){
	var ServerInit = servers[process.env.server] || servers.WebsocketServer;
	return new ServerInit();
};

const server = ServerFact();