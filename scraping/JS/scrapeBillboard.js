/**
 * NOTE:
 * If in China, the following may be required to download puppeteer
 * $ npm config set puppeteer_download_host=https://npm.taobao.org/mirrors
 * $ npm i puppeteer
 *
 */

var conf = require('./scrapeConf');
var puppeteer = require('puppeteer');
var promisify = require('util').promisify;
var fs = require('fs');
var writeFileA = promisify(fs.writeFile);
var col = require('./termColors');

/**
 * Constructor
 * @class
 */
var BillboardScraper = function(){
	this.browser = null;
	this.page = null;
};

/**
 * Start scraping
 * i) Starts puppeteer browser
 * ii) scrapes the links for the year
 * iii) calls a function to scrape data for all weekly entries
 * iv) closes the browser
 * v) writes to file
 * @instance
 */
BillboardScraper.prototype.start = async function(){
	try{
		await this.launchBrowser();
		for(var year of conf.year){
			var linkArr = await this.scrapeYearLinks(year);
			console.log(col.green, `Scraped liks for year ${year}`);
			var data = await this.scrapeSiteInfo(linkArr);
			console.log(col.magenta, `Scraped data for year ${year}`);
			writeFileA(`${__dirname}/data/${year}.json`, JSON.stringify(data));
			console.log(col.cyan, `Written data to ./data/${year}.json`);
		}
		this.browser.close();
		console.log(col.green, `Done`);
	} catch(e){
		console.error(col.red, e);
	}
};

/**
 * launchBrowser
 * Launches browser and a new page/tab and keeps this as instance
 * variables for other methods to access further down the data processing line
 * @instance
 */
BillboardScraper.prototype.launchBrowser = async function(){
	this.browser = await puppeteer.launch({headless: conf.headless});
	this.page = await this.browser.newPage();
};

/**
 * getYearUrl
 * @returns {String}
 * @param {number} year
 * @private
 * @static
 */
var getYearUrl = (year) => `https://www.billboard.com/archive/charts/${year}/hot-100`;


/**
 * scrapeYearLinks
 * Takes a year, go to the URL for given year
 * and returns an array of all the links for that year
 * @returns {Array<string>} linkArr
 * @param {number} year
 * @instance
 */
BillboardScraper.prototype.scrapeYearLinks = async function(year){
	await this.page.goto(getYearUrl(year),
	{ waitUntil: 'networkidle2' });

	var linkArr = await this.page.evaluate(()=>{
		var elements = document.querySelectorAll('.archive-table a');
		var linkArr = Array.prototype.map.call(elements, (el) => el.href);
		return linkArr;
	});
	return linkArr;
};

/**
 * gatherData
 * For each week,
 * scrapes data for the artist with rank 1
 * then rank 2-99 and adds properties to data object
 * which is returned as a promise.
 * @param {string} link
 * @returns {Promise<object>} weeklyRankings
 * @private
 * @static
 */
var gatherData = async function(link){
	var weeklyRankings = await this.page.evaluate(()=>{
		var firstRank = { rank: 1 };
		firstRank.artist = document.querySelector('.chart-number-one__artist').textContent;
		firstRank.title = document.querySelector('.chart-number-one__title').textContent;
		var rankElems = document.querySelectorAll('.chart-list-item ');
		var rank2to100 = Array.prototype.map.call(rankElems, el => ({
			rank: el.getAttribute("data-rank"),
			artist: el.getAttribute("data-artist"),
			title: el.getAttribute("data-title")
		}));
		return [firstRank].concat(rank2to100);
	});
	return weeklyRankings;
};

/**
 * scrapeSiteInfo
 * Goes through each link of array
 * Go to page, and write scraped data to an object with the date as key
 * @param {Array<string>} linkArr
 * @returns {object} dataCol
 * @instance
 */
BillboardScraper.prototype.scrapeSiteInfo = async function(linkArr){
	var dataCol = {};
	for(var link of linkArr){
		await this.page.goto(link,{ waitUntil: 'networkidle2' });
		var key = link.split("/").pop();
		dataCol[key] = await gatherData.call(this, link);
		await setTimeout(()=>{ return}, 1000);
	}
	return dataCol;
};



new BillboardScraper().start();