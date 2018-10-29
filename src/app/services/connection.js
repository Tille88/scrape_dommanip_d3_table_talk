import MockServer from '../../lib/server/mockServer';
import serverEnum from './serverenum';
import conf from '../config';

var ServerConnection = function(cb){
	this.connection = this.getConnection(cb);
};

ServerConnection.prototype.getConnection = function(cb){
	var connection;
	if(conf.server === serverEnum.MOCK_SERVER){
		connection = new MockServer(cb);
	} else if(conf.server === serverEnum.WEBSOCKET_SERVER){
		connection = new WebSocket(`ws:localhost:${conf.port}`).onmessage = function (event) {
			cb(JSON.parse(event.data));
		};
	}
	return connection;
};

export default ServerConnection;