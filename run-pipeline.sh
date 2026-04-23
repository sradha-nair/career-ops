#!/usr/bin/env bash
# run-pipeline.sh — Autonomous scan + evaluate pipeline
# Runs without an active Claude Code session.
# Set up as a cron job: */30 * * * * /path/to/career-ops/run-pipeline.sh
#
# Step 1: scan.mjs (zero Claude tokens) — finds fresh jobs on Greenhouse/Ashby/Lever
# Step 2: claude -p (headless batch) — evaluates pending pipeline items
#
# Requirements: node, claude CLI, .env with ANTHROPIC_API_KEY

set -euo pipefail
cd "$(dirname "$0")"

LOG="data/pipeline-run.log"
LOCKFILE="data/pipeline.lock"
mkdir -p data

# Prevent overlapping runs
if [ -f "$LOCKFILE" ]; then
  echo "[$(date -u +%H:%M:%S)] Already running (lockfile exists), skipping" >> "$LOG"
  exit 0
fi
echo $$ > "$LOCKFILE"
trap 'rm -f "$LOCKFILE"' EXIT

echo "" >> "$LOG"
echo "=== $(date -u '+%Y-%m-%d %H:%M UTC') ===" >> "$LOG"

# ── Step 1: Zero-token scan ──────────────────────────────────────────
echo "[scan] Starting zero-token portal scan..." >> "$LOG"
if node scan.mjs >> "$LOG" 2>&1; then
  echo "[scan] Done" >> "$LOG"
else
  echo "[scan] WARN: scan.mjs exited with errors (check above)" >> "$LOG"
fi

# ── Step 2: Check for pending items ─────────────────────────────────
PENDING=$(grep -c '^\- \[ \]' data/pipeline.md 2>/dev/null || echo 0)
echo "[pipeline] Pending items: $PENDING" >> "$LOG"

if [ "$PENDING" -eq 0 ]; then
  echo "[pipeline] Nothing to evaluate, skipping Claude" >> "$LOG"
  exit 0
fi

# ── Step 3: Claude headless evaluation ──────────────────────────────
echo "[pipeline] Launching Claude headless evaluation for $PENDING items..." >> "$LOG"

claude --dangerously-skip-permissions -p "
You are running the career-ops pipeline for Sradha N (UAE resident, sradhanair125@gmail.com).

Read data/pipeline.md. For each unchecked item (- [ ]):
1. Evaluate using modes/_profile.md scoring rules (UAE focus — internship/trainee/entry-level)
2. CV is in cv.md — framing: technology, strategy, management, finance (NOT just PM)
3. Write report to reports/{###}-{slug}-$(date +%Y-%m-%d).md
4. Write TSV to batch/tracker-additions/{###}-{slug}.tsv
5. Mark as [x] in pipeline.md
6. Auto-submit score >= 4.0 if application URL is accessible

After all evaluations:
- Run: node merge-tracker.mjs
- Run: git add reports/ batch/ data/pipeline.md data/applications.md data/scan-history.tsv
- Run: git commit -m 'feat: pipeline auto-run $(date +%Y-%m-%d)'
- Run: git push -u origin claude/setup-cv-job-search-lHI1m

Process max 15 items per run to stay within rate limits.
" >> "$LOG" 2>&1

echo "[pipeline] Claude evaluation complete" >> "$LOG"
