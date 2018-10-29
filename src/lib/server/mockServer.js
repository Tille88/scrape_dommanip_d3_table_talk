import DATA from './../../../scraping/R/04_clean_data_json/static_data';
import conf from '../../app/config';

var MockServer = function(cb){
	this.keys = Object.keys(DATA);
	this.interval = conf.mockserverInterval;
	this.currIdx = 0
	this.intervalHandle = setInterval(() => {
		this.currIdx = this.currIdx >= this.keys.length - 1 ? 0 : ++this.currIdx;
		cb(DATA[this.keys[this.currIdx]]);
	}, this.interval);
};

export default MockServer;