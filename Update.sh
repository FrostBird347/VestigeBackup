#!/bin/bash
cd "$(dirname "$0")"

rm ./LatestDL.csv
DownloadID="$(cat DownloadID)"
wget "https://docs.google.com/spreadsheet/ccc?key=$DownloadID&output=csv" -O "./LatestDL.csv" --no-verbose

OldLineCount="$(wc -l ./VestigeDownload.csv  | awk '{ print $1 }')"
printf "$(cat VestigeDownload.csv)\n-----NEXTFILE-----\n$(cat LatestDL.csv)" | jsc ./merge.js > Merge.csv

rm ./LatestDL.csv
cat ./Merge.csv > VestigeDownload.csv
rm ./Merge.csv

git add ./VestigeDownload.csv
git commit -m "Updated backup: $OldLineCount -> $(wc -l ./VestigeDownload.csv  | awk '{ print $1 }')"