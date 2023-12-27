const csv = require("csv-parse/sync");
const fs = require('fs');
const JSDOM = require("jsdom").JSDOM;
let Plot;

let slugcatColourKey = {
	"Custom Colour/Modded Campaigns": "#0F0F0F",
	"Survivor": "#ffffff",
	"Monk": "#ffff73",
	"Hunter": "#ff7373",
	"Gourmand": "#f0c097",
	"Artificer": "#70223b",
	"Rivulet": "#91ccf0",
	"Spearmaster": "#4f2d68",
	"Saint": "#aaf155",
	"Inv": "#16234f"
}
regionKey = {
	"MODDED": {name: "Modded Regions", colour: "#0f0f0f"},
	"SU": {name:"Outskirts", colour: "#38c79e"},
	"HI": {name:"Industrial Complex", colour: "#75ced5"},
	"DS": {name:"Drainage System", colour: "#e84dff"},
	"CC": {name:"Chimney Canopy", colour: "#c53d0f"},
	"GW": {name:"Garbage Wastes", colour: "#8dbd42"},
	"SH": {name:"Shaded Citadel", colour: "#515151"},
	"VS": {name:"Pipeyard", colour: "#75405c"},
	"SL": {name:"Shoreline", colour: "#ede5cc"},
	"SI": {name:"Sky Islands", colour: "#ffd0aa"},
	"LF": {name:"Farm Arrays", colour: "#608c9e"},
	"UW": {name:"The Exterior", colour: "#886b57"},
	"SS": {name:"Five Pebbles", colour: "#ffb447"},
	"SB": {name:"Subterranean", colour: "#7e4337"},
	"OE": {name:"Outer Expanse", colour: "#d8ae8a"},
	"MS": {name:"Submerged Superstructure", colour: "#3a808f"},
	"LM": {name:"Waterfront Facility", colour: "#7cc2f5"},
	"LC": {name:"Metropolis", colour: "#7f3339"},
	"RM": {name:"The Rot", colour: "#9c00ff"},
	"UG": {name:"Undergrowth", colour: "#8fb572"},
	"HR": {name:"Rubicon", colour: "#cd6f00"},
	"GATE": {name:"Region Gate", colour: "#F0F0F0"}
}
let datasets = {
	vestigeList: [],
	vestigeListOnlyModdedRegions: [],
	vestigeListOnlyModdedSlugcats: [],
	regionCounts: [
		{id: "MODDED", count: 0},
		{id: "SU", count: 0},
		{id: "HI", count: 0},
		{id: "DS", count: 0},
		{id: "CC", count: 0},
		{id: "GW", count: 0},
		{id: "SH", count: 0},
		{id: "VS", count: 0},
		{id: "SL", count: 0},
		{id: "SI", count: 0},
		{id: "LF", count: 0},
		{id: "UW", count: 0},
		{id: "SS", count: 0},
		{id: "SB", count: 0},
		{id: "OE", count: 0},
		{id: "MS", count: 0},
		{id: "LM", count: 0},
		{id: "LC", count: 0},
		{id: "RM", count: 0},
		{id: "UG", count: 0},
		{id: "HR", count: 0},
		{id: "GATE", count: 0}
	],
	slugcatCounts: [
		{name: "Custom Colour/Modded Campaigns", count: 0},
		{name: "Survivor", count: 0},
		{name: "Monk", count: 0},
		{name: "Hunter", count: 0},
		{name: "Gourmand", count: 0},
		{name: "Artificer", count: 0},
		{name: "Rivulet", count: 0},
		{name: "Spearmaster", count: 0},
		{name: "Saint", count: 0},
		{name: "Inv", count: 0}
	],
	counters: []
}

let slugcatColourList = [];
let slugcatNameList = [];
let regionColourList = [];
let regionNameList = [];
for (let i = 0; i < datasets.slugcatCounts.length; i++) {
	slugcatColourList.push(slugcatColourKey[datasets.slugcatCounts[i].name]);
	slugcatNameList.push(datasets.slugcatCounts[i].name);
}
for (let i = 0; i < datasets.regionCounts.length; i++) {
	regionColourList.push(regionKey[datasets.regionCounts[i].id].colour);
	regionNameList.push(regionKey[datasets.regionCounts[i].id].name);
}


//----------
//Functions

async function loadPlot() {
	console.log("Loading plot...");
	Plot = await import("@observablehq/plot");
	realStart();
}

function getSlugcat(r, g, b) {
	let rgb = `${r},${g},${b}`;
	switch(rgb) {
		case "1,1,1":
			return "Survivor"
		case "1,1,0.4509804":
			return "Monk"
		case "1,0.4509804,0.4509804":
			return "Hunter"
		case "0.94118,0.75686,0.59216":
			return "Gourmand"
		case "0.43922,0.13725,0.23529":
			return "Artificer"
		case "0.56863,0.8,0.94118":
			return "Rivulet"
		case "0.31,0.18,0.41":
			return "Spearmaster"
		case "0.66667,0.9451,0.33725":
			return "Saint"
		case "0.09,0.14,0.31":
			return "Inv"
		default:
			return "Custom Colour/Modded Campaigns"
	}
}

function saveGraph(graph, fileName) {
	graph.setAttribute("xmlns", "http://www.w3.org/2000/svg");
	graph.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
	fs.writeFileSync("./Stats_" + fileName.replaceAll(" ", "") + ".svg", graph.outerHTML.replaceAll("&nbsp;", " "));
}

function parseDate(dateString) {
	let fixedTime = dateString.split("/")[2].split(" ")[0] + "-" + dateString.split("/")[1] + "-" + dateString.split("/")[0]
	fixedTime += "T" + dateString.split(" ")[1] + ".000Z";
	return new Date(Date.parse(fixedTime));
}


//----------
//Start

loadPlot();
function realStart() {
	console.log("Reading csv...");
	let vestiges = csv.parse(fs.readFileSync('./VestigeBackup.csv'));
	
	let currentTime = 1677369600000 - 57600000;
	let vestigeCounters = [];
	
	console.log("Parsing...");
	for (let i = 1; i < vestiges.length; i++) {
		let newVestige = {};
		newVestige.rawTimestamp = vestiges[i][0]
		newVestige.room = vestiges[i][1];
		newVestige.rawRegionId = vestiges[i][2];
		newVestige.regionId = vestiges[i][2];
		newVestige.rawColour = [vestiges[i][3], vestiges[i][4], vestiges[i][5]];
		newVestige.slugcat = getSlugcat(vestiges[i][3], vestiges[i][4], vestiges[i][5]);
		newVestige.spawnPos = [vestiges[i][6], vestiges[i][7]];
		newVestige.spawnPosX = parseInt(vestiges[i][6]);
		newVestige.spawnPosY = parseInt(vestiges[i][7]);
		newVestige.targetPos = [vestiges[i][8], vestiges[i][9]];
		newVestige.targetPosX = parseInt(vestiges[i][8]);
		newVestige.targetPosY = parseInt(vestiges[i][9]);
		newVestige.travelDistX = newVestige.targetPosX - newVestige.spawnPosX;
		newVestige.travelDistY = newVestige.targetPosY - newVestige.spawnPosY;
		
		newVestige.timestamp = parseDate(newVestige.rawTimestamp);
		
		if (regionKey[newVestige.regionId] == undefined) {
			newVestige.regionId = "MODDED";
		}
		newVestige.regionName = regionKey[newVestige.regionId].name;
		
		datasets.vestigeList.push(newVestige);
		datasets.regionCounts[regionNameList.indexOf(newVestige.regionName)].count++;
		datasets.slugcatCounts[slugcatNameList.indexOf(newVestige.slugcat)].count++;
		
		//For each new day, add an entry
		while (newVestige.timestamp.valueOf() - currentTime >= 57600000) {
			vestigeCounters.push(0);
			currentTime += 57600000;
			let newCounter = {time: new Date(currentTime)};
			
			let lastValue = 0;
			if (datasets.counters.length != 0) lastValue = datasets.counters[datasets.counters.length - 1].activeCount;
			let newValue = 0;
			if (vestigeCounters.length >= 2) newValue = vestigeCounters[vestigeCounters.length - 2];
			let minusValue = 0;
			if (vestigeCounters.length >= 31) minusValue = vestigeCounters[vestigeCounters.length - 31];
			newCounter.activeCount = (lastValue + newValue - minusValue);
			
			lastValue = 0;
			if (datasets.counters.length != 0) lastValue = datasets.counters[datasets.counters.length - 1].visibleCount;
			newValue = 0;
			if (vestigeCounters.length >= 2) newValue = vestigeCounters[vestigeCounters.length - 2];
			minusValue = 0;
			if (vestigeCounters.length >= 5) minusValue = vestigeCounters[vestigeCounters.length - 5];
			newCounter.visibleCount = (lastValue + newValue - minusValue);
			
			lastValue = 0;
			if (datasets.counters.length != 0) lastValue = datasets.counters[datasets.counters.length - 1].totalCount;
			newValue = 0;
			if (vestigeCounters.length >= 2) newValue = vestigeCounters[vestigeCounters.length - 2];
			newCounter.totalCount = (lastValue + newValue);
			
			datasets.counters.push(newCounter);
		}
		vestigeCounters[vestigeCounters.length - 1]++;
	}
	
	console.log("Generating Graphs...");
	//temporarily disable console.log, because it spams out a bunch of junk info and I don't know how to stop it
	let tempLog = console.log;
	console.log = function() {}
	
	
	let regionFreqGraph = Plot.plot({
		y: {grid: true},
		margin: 60,
		width: 830,
		color: {
			domain: regionNameList,
			range: regionColourList,
			legend: false
		},
		marks: [
			Plot.rectY(datasets.vestigeList, Plot.binX({y: "count"}, {type: "utc", order: regionNameList, domain: [parseDate(vestiges[1][0]).valueOf(), parseDate(vestiges[vestiges.length - 1][0]).valueOf()], x: "timestamp", fill: "regionName"})),
			Plot.ruleY([0])
		],
		style: {color: "dodgerblue"},
		document: (new JSDOM(`...`)).window.document
	})
	//Manually add hardcoded legend before saving because enabling the legend option above turns the output into a html file
	regionFreqGraph.innerHTML += fs.readFileSync('./Stats_RegionFreqL.svg');
	regionFreqGraph.setAttribute("height", 470 + 94);
	regionFreqGraph.setAttribute("viewBox", regionFreqGraph.getAttribute("viewBox").replaceAll("470", (470 + 94)));
	saveGraph(regionFreqGraph, "RegionFreq");
	
	
	let slugcatFreqGraph = Plot.plot({
		y: {grid: true},
		margin: 60,
		width: 830,
		color: {
			domain: slugcatNameList,
			range: slugcatColourList,
			legend: false
		},
		marks: [
			Plot.rectY(datasets.vestigeList, Plot.binX({y: "count"}, {type: "utc", order: slugcatNameList, domain: [parseDate(vestiges[1][0]).valueOf(), parseDate(vestiges[vestiges.length - 1][0]).valueOf()], x: "timestamp", fill: "slugcat"})),
			Plot.ruleY([0])
		],
		style: {color: "dodgerblue"},
		document: (new JSDOM(`...`)).window.document
	})
	//Manually add hardcoded legend before saving because enabling the legend option above turns the output into a html file
	slugcatFreqGraph.innerHTML += fs.readFileSync('./Stats_SlugcatFreqL.svg');
	slugcatFreqGraph.setAttribute("height", 470 + 94);
	slugcatFreqGraph.setAttribute("viewBox", slugcatFreqGraph.getAttribute("viewBox").replaceAll("470", (470 + 94)));
	saveGraph(slugcatFreqGraph, "SlugcatFreq");
	
	
	let activeCountGraph = Plot.line(datasets.counters, {x: "time", y: "activeCount", type: "utc", domain: [parseDate(vestiges[1][0]).valueOf(), parseDate(vestiges[vestiges.length - 1][0]).valueOf()]}).plot({
		y: {grid: true, label: "Visible Vestiges (30 days)"},
		margin: 60,
		width: 830,
		style: {color: "dodgerblue"},
		document: (new JSDOM(`...`)).window.document
	});
	saveGraph(activeCountGraph, "ActiveCount");
	
	
	let visibleCountGraph = Plot.line(datasets.counters, {x: "time", y: "visibleCount", type: "utc", domain: [parseDate(vestiges[1][0]).valueOf(), parseDate(vestiges[vestiges.length - 1][0]).valueOf()]}).plot({
		y: {grid: true, label: "Visible Vestiges (Default settings)"},
		margin: 60,
		width: 830,
		style: {color: "dodgerblue"},
		document: (new JSDOM(`...`)).window.document
	});
	saveGraph(visibleCountGraph, "VisibleCount");
	
	
	let totalCountGraph = Plot.line(datasets.counters, {x: "time", y: "totalCount", type: "utc", domain: [parseDate(vestiges[1][0]).valueOf(), parseDate(vestiges[vestiges.length - 1][0]).valueOf()]}).plot({
		y: {grid: true, label: "Total Vestiges (∞ Lifespan)"},
		margin: 60,
		width: 830,
		style: {color: "dodgerblue"},
		document: (new JSDOM(`...`)).window.document
	});
	saveGraph(totalCountGraph, "TotalCount");
	
	
	let spawnPosHeat = Plot.rect(datasets.vestigeList, Plot.bin({fill: "count"}, {x: "spawnPosX", y: "spawnPosY", thresholds: 2000, inset: 0})).plot({
		color: {scheme: "Turbo"},
		x: {domain: [-50, 300], round: true, grid: true},
		y: {domain: [-40, 230], round: true, grid: true},
		width: 830,
		style: {color: "dodgerblue"},
		document: (new JSDOM(`...`)).window.document
	});
	spawnPosHeat.innerHTML += `<mask xmlns="http://www.w3.org/2000/svg" id="Mask"><rect x="45" y="15" width="950" height="350" fill="white"/></mask>`;
	spawnPosHeat.children[9].setAttribute("mask", "url(#Mask)");
	saveGraph(spawnPosHeat, "SpawnPos");
	
	
	let targetPosHeat = Plot.rect(datasets.vestigeList, Plot.bin({fill: "count"}, {x: "targetPosX", y: "targetPosY", thresholds: 90, inset: 0})).plot({
		color: {scheme: "Turbo"},
		x: {domain: [-50, 300], round: true, grid: true},
		y: {domain: [-40, 230], round: true, grid: true},
		width: 830,
		style: {color: "dodgerblue"},
		document: (new JSDOM(`...`)).window.document
	});
	targetPosHeat.innerHTML += `<mask xmlns="http://www.w3.org/2000/svg" id="Mask"><rect x="45" y="15" width="950" height="350" fill="white"/></mask>`;
	targetPosHeat.children[9].setAttribute("mask", "url(#Mask)");
	saveGraph(targetPosHeat, "TargetPos");
	
	
	let travelDistHeat = Plot.rect(datasets.vestigeList, Plot.bin({fill: "count"}, {x: "travelDistX", y: "travelDistY", thresholds: 4000, inset: 0})).plot({
		color: {scheme: "Inferno", type: "log"},
		x: {domain: [-100, 100], round: true, grid: true},
		y: {domain: [-100, 100], round: true, grid: true},
		width: 830,
		height: 830,
		style: {color: "dodgerblue", backgroundColor: "black"},
		document: (new JSDOM(`...`)).window.document
	});
	travelDistHeat.innerHTML += `<mask xmlns="http://www.w3.org/2000/svg" id="Mask"><rect x="45" y="15" width="950" height="780" fill="white"/></mask>`;
	travelDistHeat.children[9].setAttribute("mask", "url(#Mask)");
	saveGraph(travelDistHeat, "TravelDist");
	
	
	//re-enable console.log
	console.log = tempLog;
	console.log("Saved!");
}