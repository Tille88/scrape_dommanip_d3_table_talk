/**
 * Tring to work with DOM not using any util functions
 * Fixed number of elements, placement = auto (no css...), updates = JS (minimal, text+ numbering)
 * @class Table
 */
import conf from "../config";

var ROW_CLASS = `.${conf.classNS}-table-row`;
var HEADER_ARR = ["rank", "artist", "title"];
var doc = document;

// Constructor
var Table = function(){
	this.rowNodes = [].slice.call(doc.querySelectorAll(ROW_CLASS))
		.map((row) => [].slice.call(row.children));
	this.elementArr = getRowElems.call(this, this.rowNodes, HEADER_ARR);
};

/**
 * Creates an array of objects of type, for convenience in render update function
 * {
 * artist: td
 * rank: td
 * title: td
 * }
 * @param {Array<HTMLElement>} nodeArr
 * @param {Array<string>} headerArr
 */
var getRowElems = function(nodeArr, headerArr){
	return this.rowNodes.map((row) => {
		var obj = {};
    headerArr.forEach((key, idx) => {
			obj[key] = row[idx];
		});
		return obj;
	})
};

/**
 * Render
 * Called on each data input
 * Rerenders each element content no matter if changed or not
 * Expect data coming in to have exact 10 data entries, be sorted,
 * and have keys as in HEADER_ARR
 * @param {Array<BillboardPlacements>{10}} inData
 */
Table.prototype.render = function(inData){
	inData.forEach((el, idx) => {
		HEADER_ARR.forEach(header => {
			this.elementArr[idx][header].textContent = el[header];
		});
	});
};

export default Table;