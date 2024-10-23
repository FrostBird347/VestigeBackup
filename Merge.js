const fs = require('fs');
const readline = require('readline');

async function MergeCSV() {
	let newData = fs.readFileSync('./LatestDL.csv', "utf8").split("\r\n");
	let i_nD = 1;
	
	const output = fs.createWriteStream('./Merged.csv');
	
	const oldData = readline.createInterface({
		input: fs.createReadStream('VestigeBackup.csv'),
		crlfDelay: Infinity
	});
	
	for await (const line of oldData) {
		if (i_nD < newData.length && line == newData[i_nD]) {
			i_nD++;
		}
		
		if (line != "") {
			output.write(line + "\n");
		}
	}
	
	while (i_nD < newData.length) {
		output.write(newData[i_nD] + "\n");
		i_nD++;
	}
}

MergeCSV();