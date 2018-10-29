/**
 * Tring to work with DOM not using any util functions
 * Fixed number of elements, placement = auto (no css...), updates = JS (minimal, text+ numbering)
 * @class Table
 */
import conf from "../../config";

var ROW_CLASS = `${conf.classNS}-table-row`;
var HEADER_ARR = ["rank", "artist", "title"];
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
			class: structureHTML.class,
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

// BELOW = SAME STRATEGY AS IN PREV EXAMPLE, BUT GENERATING ELEMENTS


// Constructor
// var Table = function(targetNode){
// 	this.targetNode = targetNode;
// };



// /**
//  * render
//  * Called on each data input
//  * Rerenders each element content no matter if changed or not
//  * Expect data coming in to be sorted, and have keys as in HEADER_ARR
//  * @param {Array<BillboardPlacements>} inData
//  */
// Table.prototype.render = function(inData){
// 	genList.call(this, inData);
// };

////////////////////////////////////////////////////////////////
// BELOW = NEED TO KEEP STATE BECAUSE WANT TO NOT UPDATE ALL...

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
				keyFunc: getKeyFunc(inData[idx]["key"])
			};
		});
	} else{
		// Assuming the browser knows to batch up the reflows etc, these don't depend on each other so ought to be okay... so single syncronous method for updates...
		this.nodes.forEach(function(nodeObj, idx){
			var data = inData[idx];
			if(nodeObj.keyFunc(data.key)) { return; }
			nodeObj.node.textContent = `${data.rank} - ${data.artist} - ${data.title}`;
			nodeObj.keyFunc = getKeyFunc(data.key);
		});
	}
};


export default Table;