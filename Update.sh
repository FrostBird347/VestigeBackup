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

python3 ./GenGraphs.py
/Applications/ImageOptim.app/Contents/MacOS/ImageOptim ./RegionFreq.svg ./RegionCount.svg ./SpawnPos.png ./TargetPos.png ./UniqSpawnPos.png ./UniqTargetPos.png ./SlugcatFreq.svg ./HourFreq.svg ./TotalVestiges.svg ./VestigeDiff.svg >/dev/null 2>&1

git add ./VestigeBackup.csv ./RegionFreq.svg ./RegionCount.svg ./SpawnPos.png ./TargetPos.png ./UniqSpawnPos.png ./UniqTargetPos.png ./SlugcatFreq.svg ./HourFreq.svg ./TotalVestiges.svg ./VestigeDiff.svg
git commit -m "Updated backup: $OldLineCount -> $(wc -l ./VestigeBackup.csv  | awk '{ print $1 }')"