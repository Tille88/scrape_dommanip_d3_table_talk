import ServerConnection from '../../services/connection';
import Table from './table';

var main = function(){
	console.log("App started...");

	var targetNode = document.querySelector("#target-node");
	var table = new Table(targetNode);
	var serverconnection = new ServerConnection(table.render.bind(table));

}

export default main;