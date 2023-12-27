#!/bin/bash
cd "$(dirname "$0")"

DownloadID="$(cat ./DownloadID)"
wget "https://docs.google.com/spreadsheet/ccc?key=$DownloadID&output=csv" -O "./LatestDL.csv" --no-verbose

OldLineCount="$(wc -l ./VestigeBackup.csv  | awk '{ print $1 }')"
printf "$(cat ./VestigeBackup.csv)\n-----NEXTFILE-----\n$(cat ./LatestDL.csv)" | jsc ./Merge.js > ./Merged.csv

rm ./LatestDL.csv
cat ./Merged.csv > ./VestigeBackup.csv
rm ./Merged.csv
echo "Downloaded: $OldLineCount -> $(wc -l ./VestigeBackup.csv  | awk '{ print $1 }')"

node ./GenGraphs.js
/Applications/ImageOptim.app/Contents/MacOS/ImageOptim ./Stats_ActiveCount.svg ./Stats_RegionFreq.svg ./Stats_SlugcatFreq.svg ./Stats_SpawnPos.svg ./Stats_TargetPos.svg ./Stats_TotalCount.svg ./Stats_TravelDist.svg ./Stats_VisibleCount.svg >/dev/null 2>&1

git add ./VestigeBackup.csv ./Stats_ActiveCount.svg ./Stats_RegionFreq.svg ./Stats_SlugcatFreq.svg ./Stats_SpawnPos.svg ./Stats_TargetPos.svg ./Stats_TotalCount.svg ./Stats_TravelDist.svg ./Stats_VisibleCount.svg
git commit -m "Updated backup: $OldLineCount -> $(wc -l ./VestigeBackup.csv  | awk '{ print $1 }')"