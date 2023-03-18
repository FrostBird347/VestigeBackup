#!/bin/bash
cd "$(dirname "$0")"

rm ./LatestDL.csv
DownloadID="$(cat DownloadID)"
wget "https://docs.google.com/spreadsheet/ccc?key=$DownloadID&output=csv" -O "./LatestDL.csv" --no-verbose

OldLineCount="$(wc -l ./VestigeBackup.csv  | awk '{ print $1 }')"
printf "$(cat VestigeBackup.csv)\n-----NEXTFILE-----\n$(cat LatestDL.csv)" | jsc ./merge.js > Merge.csv

rm ./LatestDL.csv
cat ./Merge.csv > VestigeBackup.csv
rm ./Merge.csv

git add ./VestigeBackup.csv
git commit -m "Updated backup: $OldLineCount -> $(wc -l ./VestigeBackup.csv  | awk '{ print $1 }')"