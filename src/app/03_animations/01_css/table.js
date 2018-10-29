/**
 * Starting point = 02/01 - vanilla JS
 * @class Table
 */
import conf from "../../config";

var ROW_CLASS = `${conf.classNS}-table-row`;
var structureHTML = {tag: 'div', class: ROW_CLASS};
var doc = document;


//////////////////////////////////////////////////////////////////////
var genList = function(inData){
	this.targetNode.innerHTML = '';
	// Want to avoid dom calculations before all elements are in place, so doing it in one run
	var df = doc.createDocumentFragment();
	inData.forEach((dataObj, idx) => {
		df.appendChild(genRowElem({
			tag: structureHTML.tag,
			// CHANGE!!!
			class: `${structureHTML.class} ${conf.classNS}-row-${idx}`,
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
};

var getKeyFunc = function(key){
	return (function(elKey){
		return function(newKey){
			return elKey === newKey;
		};
	}(key))
}

var listElementUpdateHelper = function(idx, dataObj, nodeObj){
	nodeObj.class = `${conf.classNS}-row-${idx}`;
	nodeObj.node.textContent = `${dataObj.rank} - ${dataObj.artist} - ${dataObj.title}`;
	nodeObj.node.classList.add(nodeObj.class);
	nodeObj.key = dataObj.key;
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
				key: inData[idx]["key"],
				// keyFunc: getKeyFunc(inData[idx]["key"]),
				// CHANGE!
				class: child.classList[1]
			};
		});
	} else{
		// Assuming the browser knows to batch up the reflows etc, these don't depend on each other so ought to be okay... so single syncronous method for updates...
		// Lookup object that needs to be cleared (i.e. all data needs binding to element) before done
		var keyLookup = {};
		inData.forEach((data, idx) => {keyLookup[data.key] = idx});
		// Easiest to just keep track of those elements that needs to be exited
		// Also since need a delay in the animation
		var exit = [];
		// Go through nodes
		this.nodes.forEach(function(nodeObj, idx){
			var data = inData[idx];
			// Deals with no change at all
			if(nodeObj.key === data.key &&
				// Bug -> need to check if not accidentally the index passed in...
				nodeObj.class.split("-")[2] == idx) {
				delete keyLookup[data.key];
				return;
			}
			// Remove old class always done if reached this location
			nodeObj.node.classList.remove(nodeObj.class);
			var newIdx = keyLookup[nodeObj.key];
			// If it still is on list, but new position
			if(typeof newIdx !== "undefined"){
				var dataObj = inData[newIdx];
				listElementUpdateHelper(newIdx, dataObj, nodeObj);
				delete keyLookup[nodeObj.key];
			} else{
				// Will be changed to new entry
				exit.push(nodeObj);
			}
		});
		// Since CSS transition, use setTimeout-"hack"
		setTimeout(() => {
			var i = 0;
			for(var key in keyLookup){
				// Data idx to be added
				var dataIdx = keyLookup[key];
				var data = inData[dataIdx];
				var nodeObj = exit[i++];
				listElementUpdateHelper(dataIdx, data, nodeObj);
			};
		}, conf.mockserverInterval/3);
	}
};


export default Table;