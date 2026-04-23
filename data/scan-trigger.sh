#!/bin/bash
# Writes a trigger every 3 hours so the monitor fires a new scan+pipeline run
cd /home/user/career-ops
while true; do
  sleep 10800
  echo "$(date +%s)" > data/scan-trigger
done
