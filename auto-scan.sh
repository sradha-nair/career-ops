#!/bin/bash
# auto-scan.sh — runs scan.mjs every 3 hours in a loop
# Start with: nohup bash auto-scan.sh &
# Stop with:  kill $(cat data/auto-scan.pid)
# Logs:       tail -f data/scan.log

cd "$(dirname "$0")"
echo $$ > data/auto-scan.pid

echo "[$(date)] auto-scan started (interval: 3h)" >> data/scan.log

while true; do
  echo "[$(date)] scan starting..." >> data/scan.log
  node scan.mjs >> data/scan.log 2>&1
  echo "[$(date)] scan done. sleeping 3h..." >> data/scan.log
  sleep 10800
done
