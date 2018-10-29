/**
 * D3 version, no exits and additional enters...
 * @class Table
 */
import conf from "../../config";
import d3 from '../../../lib/d3';

var ROW_CLASS = `${conf.classNS}-table-row`;

// Constructor
var Table = function(targetNode){
	this.targetNode = targetNode;
};

var textFunc = d => `${d.rank} - ${d.artist} - ${d.title}`;

/**
 * render
 * FIRST RUN THROUGH: gets data and generates state with key function
 * FOLLOWING: avoids updates if key for same element constant
 * @param {Array<BillboardPlacements>} inData
 */
Table.prototype.render = function(inData){

	// 1) No data function => will just assume each position...
	// Will rerender if any change
	// if(!this.nodes){
	// 	this.nodes = d3.select(this.targetNode)
	// 		.selectAll("div")
	// 		.data(inData)
	// 		.enter()
	// 		.append("div");

	// 		this.nodes
	// 			.text(textFunc);
	// }else{
	// 	this.nodes
	// 		.data(inData)
	// 		.text(textFunc);
	// }

	// 2) Have data function, if the key of the position hasnt changed => no update
	if(!this.nodes){
		this.nodes = d3.select(this.targetNode)
			.selectAll("div")
			.data(inData, d => d.key)
			.enter()
			.append("div");

			this.nodes
				.text(textFunc);
	}else{
		this.nodes
			.data(inData, d => d.key)
			.text(textFunc);
	}

};


export default Table;