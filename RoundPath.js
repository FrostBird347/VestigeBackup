const readline = require('readline');

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false
});

rl.on('line', (line) => {
	//Shouldn't go over 16, but im checking if it's below 20 to be safe
	let splitLine;
	if (line.length < 20 && (splitLine = line.split("L")) && splitLine.length == 2 && splitLine[1].endsWith(",")) {
		let output = (Math.round(parseFloat(splitLine[0]) * 100) / 100) + "L";
		output += (Math.round(parseFloat(splitLine[1].trimEnd(',')) * 100) / 100) + ",";
		console.log(output);
	} else {
		console.log(line);
	}
});

rl.once('close', () => {});