/**
 * D3 version, Exits...
 * @class Table
 */
import conf from "../../config";
import d3 from '../../../lib/d3';

var ROW_CLASS = `${conf.classNS}-table-row`;

// Constructor
var Table = function(targetNode){
	this.targetNodeSel = d3.select(targetNode);
	this.nodes = null;
};

var textFunc = d => `${d.rank} - ${d.artist} - ${d.title}`;

/**
 * render
 * FIRST RUN THROUGH: gets data and generates state with key function
 * FOLLOWING: avoids updates if key for same element constant
 * @param {Array<BillboardPlacements>} inData
 */
Table.prototype.render = function(inData){
	// console.log(inData);
	if(!this.nodes){
		// Create our divs
		this.nodes = this.targetNodeSel.selectAll("div")
			// .selectAll("div")
			.data(inData, d => d.key)
			.enter()
			.append("div");

		this.nodes
			.classed(ROW_CLASS, true)
			.text(textFunc)
			.style("transform", (d) => `translateY(${d.rank*58}px)`);
	}else{
		var t = d3.transition().duration(1000);

		// On updates
		var updateSel = this.nodes
			.data(inData, d => d.key)
			.text(textFunc);

		// Get exit selection (not in data)
		updateSel.exit()
			.transition(t)
			.text("exit")
			.style("transform", () => `translateY(${1000}px)`)
			.remove();

		// Get enter selection
		var enter = updateSel.enter()
			.append('div').classed(ROW_CLASS, true)
			.text(textFunc)
			.style("transform", (d) => `translateY(${1000}px)`);

		// Need to update the selection and do uniform transition
		this.nodes = enter.merge(updateSel);
		this.nodes.transition(t)
		.style("transform", (d) => `translateY(${d.rank*58}px)`);
	}
};


export default Table;