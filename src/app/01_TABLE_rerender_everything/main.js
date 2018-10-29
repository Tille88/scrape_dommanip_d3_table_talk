import ServerConnection from '../services/connection';
import Table from './table';

var main = function(){
	console.log("App started...");

	// Placeholder render function => table.render...
	var render = function(data){
		// console.log("render function", data);
	};

	var table = new Table();
	var serverconnection = new ServerConnection(table.render.bind(table));
	// var serverconnection = new ServerConnection(render);

}

export default main;