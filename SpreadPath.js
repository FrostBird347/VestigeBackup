//Lazy script to split path entries across multiple lines to save space in git commits
//It won't work on arbitray svg files, but should be enough for this
const readline = require('readline');
let buffer = [],
	output = "",
	state = "outside";
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false
});

function check(query) {
	let matched = false;
	if (query.length <= buffer.length) {
		matched = true
		for (let i = 0; i < query.length && matched; i++)
			matched = query[i].includes(buffer[buffer.length - (query.length - i)]);
	}
	return matched;
}

function flush() {
	output += buffer.join("");
	buffer = [];
}

function splitPath() {
	if (", -.MmLlHhVvCcSsQqTtAa".includes(output.slice(-1))) {
		if (output.slice(-1) != ' ')
			buffer.unshift(output.slice(-1));
		output = output.slice(0, -1) + '\n';
	} else if (output.slice(-1) != '\n')
		output += '\n'
}

function count(query) {
	let total = 0;
	for (let i = 0; i < query.length; i++) {
		buffer.forEach(char => {
			if (query[i].includes(char))
				total++;
		})
	}
	return total;
}

rl.on('line', (line) => {
	let chars = line.split("");
	for (let i = 0; i < chars.length; i++) {
		buffer.push(chars[i]);
		switch(state) {
			case "outside":
				if (chars[i] == '<') {
					flush();
					state = "element";
				}
				break;
			case "element":
				if (check([' ', 'd', '=', '"'])) {
					flush();
					state = "path"
					nowType = "";
					nxtType = "";
				} else if (check(['=', '"'])) {
					flush();
					state = "attribute"
				} else if (chars[i] == '>') {
					flush();
					state = "outside"
				}
				break;
			case "attribute":
				if (chars[i] == '"') {
					flush();
					state = "element";
				}
				break;
			case "path":
				if ("MmLlHhVvCcSsQqTtAa, ".includes(chars[i]) || (chars[i] == '-' && "0123456789".includes(chars[i - 1])) || count(['.']) > 1) {
					flush();
					splitPath();
				}
				if (chars[i] == '"') {
					flush();
					state = "element";
				}
				break;
		}
	}
	buffer.push('\n');
});

rl.once('close', () => {
	console.log(output.trim());
});
