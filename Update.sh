#!/bin/bash
cd "$(dirname "$0")"

DownloadID="$(cat ./DownloadID)"
wget "https://docs.google.com/spreadsheet/ccc?key=$DownloadID&output=csv" -O "./LatestDL.csv" --no-verbose

OldLineCount="$(wc -l ./VestigeBackup.csv  | awk '{ print $1 }')"
node ./Merge.js

rm ./LatestDL.csv
cat ./Merged.csv > ./VestigeBackup.csv
rm ./Merged.csv
echo "Downloaded: $OldLineCount -> $(wc -l ./VestigeBackup.csv  | awk '{ print $1 }')"

node ./GenGraphs.js

/Applications/ImageOptim.app/Contents/MacOS/ImageOptim ./Stats_ActiveCount.svg ./Stats_RegionFreq.svg ./Stats_RegionPercent.svg ./Stats_SlugcatFreq.svg ./Stats_SlugcatPercent.svg ./Stats_SpawnPos.svg ./Stats_TargetPos.svg ./Stats_TotalCount.svg ./Stats_TravelDist.svg ./Stats_VisibleCount.svg >/dev/null 2>&1
echo "Compressed 1/3"
# for come reason adding whitespace and running it a second time gives more compression improvements (the third one is just to be extra sure the output is always the same)
for svg in ./Stats_ActiveCount.svg ./Stats_RegionFreq.svg ./Stats_RegionPercent.svg ./Stats_SlugcatFreq.svg ./Stats_SlugcatPercent.svg ./Stats_SpawnPos.svg ./Stats_TargetPos.svg ./Stats_TotalCount.svg ./Stats_TravelDist.svg ./Stats_VisibleCount.svg
do
	echo " " >> "$svg"
done
/Applications/ImageOptim.app/Contents/MacOS/ImageOptim ./Stats_ActiveCount.svg ./Stats_RegionFreq.svg ./Stats_RegionPercent.svg ./Stats_SlugcatFreq.svg ./Stats_SlugcatPercent.svg ./Stats_SpawnPos.svg ./Stats_TargetPos.svg ./Stats_TotalCount.svg ./Stats_TravelDist.svg ./Stats_VisibleCount.svg >/dev/null 2>&1
echo "Compressed 2/3"
for svg in ./Stats_ActiveCount.svg ./Stats_RegionFreq.svg ./Stats_RegionPercent.svg ./Stats_SlugcatFreq.svg ./Stats_SlugcatPercent.svg ./Stats_SpawnPos.svg ./Stats_TargetPos.svg ./Stats_TotalCount.svg ./Stats_TravelDist.svg ./Stats_VisibleCount.svg
do
	echo " " >> "$svg"
done
/Applications/ImageOptim.app/Contents/MacOS/ImageOptim ./Stats_ActiveCount.svg ./Stats_RegionFreq.svg ./Stats_RegionPercent.svg ./Stats_SlugcatFreq.svg ./Stats_SlugcatPercent.svg ./Stats_SpawnPos.svg ./Stats_TargetPos.svg ./Stats_TotalCount.svg ./Stats_TravelDist.svg ./Stats_VisibleCount.svg >/dev/null 2>&1
echo "Compressed 3/3"

# I am beginning to suspect that git only stores changed lines and nothing more specific, so we indent it to hopefully stop the repo size from getting too much larger (it's currently over 500MB)
for svg in ./Stats_ActiveCount.svg ./Stats_RegionFreq.svg ./Stats_RegionPercent.svg ./Stats_SlugcatFreq.svg ./Stats_SlugcatPercent.svg ./Stats_SpawnPos.svg ./Stats_TargetPos.svg ./Stats_TotalCount.svg ./Stats_TravelDist.svg ./Stats_VisibleCount.svg
do
	cat "$svg" | xmllint --format - > _temp.svg
	cat _temp.svg > "$svg"
done
#Split the line paths to further save space
for svg in ./Stats_ActiveCount.svg ./Stats_TotalCount.svg ./Stats_VisibleCount.svg
do
	#Head doesn't support negative numbers on my system
	cat "$svg" | head -n "$(( $(wc -l "$svg" | awk '{print $1}') - 4 ))" > _temp.svg
	cat "$svg" | tail -n 4 | awk -F'\,' '{$1=$1}1' OFS='\,\n' >> _temp.svg
	cat _temp.svg > "$svg"
done
rm _temp.svg
echo "Fixed formatting for git"

git add ./VestigeBackup.csv ./Stats_ActiveCount.svg ./Stats_RegionFreq.svg ./Stats_RegionPercent.svg ./Stats_SlugcatFreq.svg ./Stats_SlugcatPercent.svg ./Stats_SpawnPos.svg ./Stats_TargetPos.svg ./Stats_TotalCount.svg ./Stats_TravelDist.svg ./Stats_VisibleCount.svg
git commit -m "Updated backup: $OldLineCount -> $(wc -l ./VestigeBackup.csv  | awk '{ print $1 }')"