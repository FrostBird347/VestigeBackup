const readline = require('readline');

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false
});

rl.on('line', (line) => {
	//Shouldn't go over 16, but im checking if it's below 20 to be safe
	if (line.length < 20 && (line.endsWith(',') || line.endsWith('L')) && !isNaN(parseFloat(line.trimEnd('L').trimEnd(',')))) {
		let type = line.endsWith(',') ? "," : "L";
		let output = (Math.round(parseFloat(line.trimEnd(type)) * 100) / 100).toFixed(2) + type;
		console.log(output);
	} else {
		console.log(line);
	}
});

rl.once('close', () => {});