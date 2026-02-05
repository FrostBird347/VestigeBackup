#!/bin/bash -l
cd "$(dirname "$0")"

DownloadID="$(cat ./DownloadID)"
wget "https://docs.google.com/spreadsheet/ccc?key=$DownloadID&output=csv" -O "./LatestDL.csv" --no-verbose

OldLineCount="$(wc -l ./VestigeBackup.csv  | awk '{ print $1 }')"
node ./Merge.js

rm ./LatestDL.csv
cat ./Merged.csv > ./VestigeBackup.csv
rm ./Merged.csv
NewLineCount="$(wc -l ./VestigeBackup.csv  | awk '{ print $1 }')"
echo "Downloaded: $OldLineCount -> $NewLineCount"

node ./GenGraphs.js

echo "Compressing..."
./node_modules/.bin/svgo --pretty --multipass ./Stats_ActiveCount.svg ./Stats_RegionFreq.svg ./Stats_RegionPercent.svg ./Stats_SlugcatFreq.svg ./Stats_SlugcatPercent.svg ./Stats_SpawnPos.svg ./Stats_TargetPos.svg ./Stats_TotalCount.svg ./Stats_TravelDist.svg ./Stats_VisibleCount.svg  ./Stats_KarmaCount.svg

#Split the line paths to further save space
for svg in ./Stats_ActiveCount.svg ./Stats_RegionFreq.svg ./Stats_RegionPercent.svg ./Stats_SlugcatFreq.svg ./Stats_SlugcatPercent.svg ./Stats_SpawnPos.svg ./Stats_TargetPos.svg ./Stats_TotalCount.svg ./Stats_TravelDist.svg ./Stats_VisibleCount.svg  ./Stats_KarmaCount.svg
do
	cat "$svg" | node SpreadPath.js > _temp.svg
	cat _temp.svg > "$svg"
done
rm _temp.svg
echo "Fixed formatting for git"

git add ./VestigeBackup.csv ./Stats_ActiveCount.svg ./Stats_RegionFreq.svg ./Stats_RegionPercent.svg ./Stats_SlugcatFreq.svg ./Stats_SlugcatPercent.svg ./Stats_SpawnPos.svg ./Stats_TargetPos.svg ./Stats_TotalCount.svg ./Stats_TravelDist.svg ./Stats_VisibleCount.svg  ./Stats_KarmaCount.svg
git commit -m "Updated backup: $OldLineCount -> $NewLineCount"

kdialog --title "VestigeBackup complete!" --passivepopup "$OldLineCount -> $NewLineCount" 99999999
