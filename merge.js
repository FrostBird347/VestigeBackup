function MergeCSV(OldCSV, NewCSV) {
	let FinalCSV = OldCSV.join("\n");
	let ReachedNewData = false;
	
	for (let i = 4; i < NewCSV.length; i++) {
		if (ReachedNewData || (
		  NewCSV[i - 4] == OldCSV[OldCSV.length - 4] &&
		  NewCSV[i - 3] == OldCSV[OldCSV.length - 3] &&
		  NewCSV[i - 2] == OldCSV[OldCSV.length - 2] &&
		  NewCSV[i - 1] == OldCSV[OldCSV.length - 1])) {
			ReachedNewData = true;
			FinalCSV += "\n" + NewCSV[i];
		}
	}
	
	print(FinalCSV);
}

function ReadInput() {
	let CSVFiles = [decodeURIComponent(escape(readline())), ""];
	let FileIndex = 0;
	let CurrentLine = decodeURIComponent(escape(readline()))
	
	while (CurrentLine != "") {
		if (CurrentLine == "-----NEXTFILE-----") {
			FileIndex = 1;
			CurrentLine = decodeURIComponent(escape(readline()));
		} else {
			CSVFiles[FileIndex] += "\n" + CurrentLine;
			CurrentLine = decodeURIComponent(escape(readline()));
		}
	}
	
	return CSVFiles;
}

RawFiles = ReadInput();
MergeCSV(RawFiles[0].split(/\r?\n/), RawFiles[1].split(/\r?\n/));