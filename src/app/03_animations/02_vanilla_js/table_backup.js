/**
 * Starting point = 02/01 - vanilla JS
 * @class Table
 */
import conf from "../../config";

var ROW_CLASS = `${conf.classNS}-table-row`;
var structureHTML = {tag: 'div', class: ROW_CLASS};
var doc = document;
// px's
var TOP_OFFSET_PX = 58;
var TARGET_POS = {};
for(var i=0; i<=10; i++){
	TARGET_POS[i] = i*TOP_OFFSET_PX;
}


//////////////////////////////////////////////////////////////////////
var genList = function(inData){
	this.targetNode.innerHTML = '';
	// Want to avoid dom calculations before all elements are in place, so doing it in one run
	var df = doc.createDocumentFragment();
	inData.forEach((dataObj, idx) => {
		df.appendChild(genRowElem({
			tag: structureHTML.tag,
			class: `${structureHTML.class}`,
			content: `${dataObj.rank} - ${dataObj.artist} - ${dataObj.title}`}));
	});
	this.targetNode.appendChild(df);
}


/**
 */
var genRowElem = function(elemDesc){
	if(!elemDesc.tag) { return; }
	var el = doc.createElement(elemDesc.tag);
	for(var key in elemDesc){
		if(key === 'tag' || key === 'content') { continue; }
		el.setAttribute(key, elemDesc[key]);
	}
	if(elemDesc.content){
		el.innerHTML = '' + elemDesc.content;
	}
	return el;
};

// Constructor
var Table = function(targetNode){
	this.targetNode = targetNode;
	this.animDur = 1000; //ms
	this.offCanvasPx = 1000;
};

var listElementUpdateHelper = function(idx, dataObj, nodeObj){
	// nodeObj.class = `${conf.classNS}-row-${idx}`;
	nodeObj.node.textContent = `${dataObj.rank} - ${dataObj.artist} - ${dataObj.title}`;
	nodeObj.node.classList.add(nodeObj.class);
	nodeObj.key = dataObj.key;
};

var linInterpol = function(min, max, fraction){
	var interp = (max - min) * fraction + min;
	return fraction < 1 ? interp : max;
};

var animate = function(inNodes, locAll){
	var animHandle;
	var animDur = this.animDur;
	var start = null;
	var finishedCnt = 0;
	var positionArr = inNodes.map((node) =>
		({
			start: node.topPos,
			end: locAll ? locAll : TARGET_POS[node.rank],
			finished: false
		})
	);
	var step = function step(ts){
		if(!start) { start = ts; }
		var prog = ts - start;
		positionArr.forEach((pos, idx) => {
			if(pos.finished) { return; }
			var newPos = linInterpol(pos.start, pos.end, prog/animDur);
			if(newPos===pos.end){
				inNodes[idx].topPos = newPos = pos.end;
				pos.finished = true;
				finishedCnt++;
			}
			var styleStr = `translateY(${newPos}px`;
			inNodes[idx].node.style.transform = styleStr;
		});
		if(finishedCnt === positionArr.length){
			cancelAnimationFrame(animHandle);
		} else{
			// Forgotten animhandle update = memory leak?
			animHandle = requestAnimationFrame(step);
		}
	};
	animHandle = requestAnimationFrame(step);
};


/**
 * render
 * FIRST RUN THROUGH: gets data and generates state with key function
 * FOLLOWING: avoids updates if key for same element constant
 * @param {Array<BillboardPlacements>} inData
 */
Table.prototype.render = function(inData){
	if(!this.nodes){
		genList.call(this, inData);
		this.nodes = [].map.call(this.targetNode.children, function(child, idx){
			return {
				node: child,
				content: `${inData[idx].rank} - ${inData[idx].artist} - ${inData[idx].title}`,
				key: inData[idx]["key"],
				rank: inData[idx]["rank"],
				topPos: 0,
			};
		});
		// All nodes need to be animated in, currently at 0, 0
		animate.call(this, this.nodes);
	}
	else{
	// 	// Assuming the browser knows to batch up the reflows etc, these don't depend on each other so ought to be okay... so single syncronous method for updates...
	// 	// Lookup object that needs to be cleared (i.e. all data needs binding to element) before done
		var rankLookup = {};
		inData.forEach((data) => {rankLookup[data.key] = data.rank});
		// Easiest to just keep track of those elements that needs to be exited
		// Also since need a delay in the animation
		var exit = [];
		var update = [];
		// Go through nodes
		// this.nodes.forEach(function(nodeObj, idx){
		// 	// Deals with no change at all
		// 	var newRank = rankLookup[nodeObj.key];
		// 	if(nodeObj.rank === rankLookup[nodeObj.key]){
		// 		delete rankLookup[nodeObj.key];
		// 		return;
		// 	}
		// 	// If it still is on list, but new position
		// 	if(typeof newRank !== "undefined"){
		// 		// Update Rank
		// 		nodeObj.rank = newRank;
		// 		nodeObj.content = `${newRank} - ${nodeObj.content.split("-").slice(1).join("-")}`;
		// 		nodeObj.node.textContent = nodeObj.content;
		// 		update.push(nodeObj);
		// 		delete rankLookup[nodeObj.key];
		// 	} else{
		// 		// Will be changed to new entry
		// 		exit.push(nodeObj);
		// 	}
		// });
		for(var i = 0; i < this.nodes.length; i++){
			// Deals with no change at all
			var newRank = rankLookup[this.nodes[i].key];
			if(this.nodes[i].rank === rankLookup[this.nodes[i].key]){
				delete rankLookup[this.nodes[i].key];
				return;
			}
			// If it still is on list, but new position
			if(typeof newRank !== "undefined"){
				// Update Rank
				this.nodes[i].rank = newRank;
				this.nodes[i].content = `${newRank} - ${this.nodes[i].content.split("-").slice(1).join("-")}`;
				this.nodes[i].node.textContent = this.nodes[i].content;
				update.push(this.nodes[i]);
				delete rankLookup[this.nodes[i].key];
			} else{
				// Will be changed to new entry
				exit.push(this.nodes[i]);
			}
		}
		// Do exit transitions to off canvas
		// animate.call(this, exit, this.offCanvasPx);
		// setTimeout(() => {
		// 	// After animated out, need content to be new... then animate in.
		// 	var nodeIdx = 0;
		// 	for(var key in rankLookup){
		// 		var updateIdx = rankLookup[key] - 1;
		// 		var newEntry = inData[updateIdx];
		// 		var updateNode = exit[nodeIdx++];
		// 		updateNode.rank = newEntry.rank;
		// 		updateNode.key = newEntry.key;
		// 		updateNode.content = `${newEntry.rank} - ${newEntry.artist} - ${newEntry.title}`;
		// 		updateNode.node.textContent = updateNode.content;
		// 	}
		// 	animate.call(this, exit);
		// }, this.animDur);

		// // Deal with update transitions...
		// animate.call(this, update);

	}
};


export default Table;