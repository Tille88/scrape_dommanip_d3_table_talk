/**
 * D3 version, Exits...
 * @class Table
 */
import conf from "../config";
import d3 from '../../lib/d3';

var TR_MULT = 1.5;
var CONFIG = {
	exit: [
		{dur: TR_MULT*600},
		{dur: TR_MULT*600}
	],
	enter: [
		{dur: TR_MULT*1000, del: TR_MULT*1500},
		{dur: TR_MULT*1000}
	],
	update: {
		down: [
			{dur: TR_MULT*800, del: TR_MULT*400},
			{dur: TR_MULT*800, del: TR_MULT*0},
			{dur: TR_MULT*800, del: TR_MULT*0}
		],
		noChange: [
			{dur: TR_MULT*250},
			{dur: TR_MULT*1000, del: TR_MULT*250},
			{dur: TR_MULT*250},
		]
	}
};

// Constructor
var Table = function(targetNode){
	// this.width = this.height = Math.min(targetNode.clientWidth, targetNode.clientHeight);
	this.width = window.innerWidth;
	this.height = window.innerHeight;
	this.svg = d3.select(targetNode)
		.append("svg")
		// .attr("viewBox", "0 0 100 100");
		.attr("width", this.width)
		.attr("height", this.height);
	this.gutter = this.width/10
	// this.margin = { top: this.height/20, bottom: this.height/20 };
	this.yScale = d3.scaleLinear()
		.domain([1, 11])
		.range([0, this.height]);
	this.nodes = null;

	this.defs = this.svg.append("defs")

};

var textFunc = d => `${d.artist} - ${d.title}`;

/**
 * render
 * FIRST RUN THROUGH: gets data and generates state with key function
 * FOLLOWING: avoids updates if key for same element constant
 * @param {Array<BillboardPlacements>} inData
 */
Table.prototype.render = function(inData){
	var graphHeight = this.height;
	if(!this.nodes){
		var noElems = inData.length;
		// Create our rects
		// this.nodes = this.svg.append("g").selectAll("rect")
		this.nodes = this.svg.append("g").selectAll("rect")
			.data(inData, d => d.key)
			.enter()
			// .append("g") //!!!!
			.append("rect")
			// .append("text")
			// .text(textFunc);


		// var groupings = this.svg.append("g").selectAll("rect")
		// 	.data(inData, d => d.key)
		// 	.enter()
		// 	.append("g") //!!!!

		// this.nodes = groupings.append("rect");
		// groupings
		// 	.append("text")
		// 	.text(textFunc);



		this.nodes
			.attr("x", this.gutter)
			.attr("y", (d, i) => this.yScale(d.rank))
			.attr("width", this.width - this.gutter*2)
			.attr("height", graphHeight/noElems)
			.attr("rx", "10")
			.style("fill", (d) => `rgb(${Math.floor(255/noElems*d.rank)},${Math.floor(255/noElems*d.rank)},${Math.floor(255/noElems*d.rank)})`)

			// NEEED TO GET TEXT JOINED INTO GROUPING WITH PARENT CONTAINER...
			// this.svg.append("g").selectAll("text")
			// .data(inData, d => d.key)
			// .enter()
			// .append("text")
			// .text(textFunc);

	}else{
		var exitTrans = [
			d3.transition().duration(CONFIG.exit[0].dur),
			d3.transition().duration(CONFIG.exit[1].dur)
		];
		var enterTrans = [
			d3.transition().duration(CONFIG.enter[0].dur).delay(CONFIG.enter[0].del),
			d3.transition().duration(CONFIG.enter[1].dur)
		];
		var downTrans = [
			d3.transition().duration(CONFIG.update.down[0].dur).delay(CONFIG.update.down[0].del),
			d3.transition().duration(CONFIG.update.down[1].dur).delay(CONFIG.update.down[1].del),
			d3.transition().duration(CONFIG.update.down[2].dur).delay(CONFIG.update.down[2].del)
		];
		var constTrans = [
			d3.transition().duration(CONFIG.update.noChange[1].dur),
			d3.transition().duration(CONFIG.update.noChange[0].dur).delay(CONFIG.update.down[0].del),
			d3.transition().duration(CONFIG.update.noChange[1].dur)
		];

		// On updates
		var updateSel = this.nodes
			.data(inData, d => d.key);

		var exitIdx = 0;
		var exitSel = updateSel.exit();
		exitSel.transition(exitTrans[0])
			.attr("width", this.gutter/exitSel.size())
			.attr("x", () => this.gutter + this.width - this.gutter*2 + this.gutter/exitSel.size() * exitIdx++)
			.transition(exitTrans[1])
			.attr("y", this.height)
			.remove();


		var gutterIdx = 0;
		var enter = updateSel.enter().append("rect");
			enter.attr("height", graphHeight/10) // temp 10 hard coded
			.attr("width", () => this.gutter/enter.size())
			.style("fill", (d) => `rgb(${Math.floor(255/10*d.rank)},${Math.floor(255/10*d.rank)},${Math.floor(255/10*d.rank)})`)
			.attr("x", () => gutterIdx++ * this.gutter/enter.size())
			.attr("y", this.height)
			.attr("rx", "10")
			.transition(enterTrans[0])
			.attr("y", (d) => this.yScale(d.rank))
			.transition(enterTrans[1])
			.attr("width", this.width - this.gutter*2)
			.attr("x", () => this.gutter)




		var downSel = updateSel.filter((d) => this.lastRankLookup[d.key] < d.rank)
		var downSelIdx = 0;
		downSel
		.transition(downTrans[0])
		.attr("width", this.gutter/downSel.size())
		.attr("x", () => this.gutter + this.width - this.gutter*2 + this.gutter/downSel.size() * downSelIdx++)
		.transition(downTrans[1])
		.attr("y", (d) => this.yScale(d.rank))
		.transition(downTrans[2])
		.style("fill", (d) => `rgb(${Math.floor(255/10*d.rank)},${Math.floor(255/10*d.rank)},${Math.floor(255/10*d.rank)})`)
			.attr("x", () => this.gutter)
			.attr("width", this.width - this.gutter*2)


		var upSel = updateSel.filter((d) => this.lastRankLookup[d.key] >= d.rank);
		var upSelIdx = 0;
		upSel
		.transition(constTrans[0])
		.attr("width", (this.width - this.gutter*2)/upSel.size())
		.attr("x", () => this.gutter + (this.width - this.gutter*2)/upSel.size() * upSelIdx++)
		.transition(constTrans[1])
		.attr("y", (d) => this.yScale(d.rank))
		.transition(constTrans[2])
		.attr("width", (this.width - this.gutter*2))
		.attr("x", () => this.gutter)
		.style("fill", (d) => `rgb(${Math.floor(255/10*d.rank)},${Math.floor(255/10*d.rank)},${Math.floor(255/10*d.rank)})`)

		this.nodes = enter.merge(updateSel);

	}

	this.lastRankLookup = inData.reduce((accObj, data) => {
		accObj[data.key] = data.rank;
		return accObj;
	}, {});

};


export default Table;