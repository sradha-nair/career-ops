#!/usr/bin/env node
/**
 * submit-greenhouse.mjs
 *
 * Scans Greenhouse job boards for UAE roles matching your profile,
 * then submits applications via the Greenhouse public apply API.
 *
 * No login, no CAPTCHA — Greenhouse's public /applications endpoint
 * accepts multipart/form-data directly.
 *
 * Usage:
 *   node submit-greenhouse.mjs              # scan + auto-submit 4.0+ roles
 *   node submit-greenhouse.mjs --dry-run    # preview only, no submissions
 *   node submit-greenhouse.mjs --board tabby --job 12345  # submit one specific role
 *
 * Requires: CV PDF at output/sradha-n-cv.pdf
 */

import { readFileSync, existsSync, appendFileSync, writeFileSync } from 'fs';
import { createReadStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Candidate details ──────────────────────────────────────────────
const CANDIDATE = {
  first_name: 'Sradha',
  last_name: 'N',
  email: 'sradhanair125@gmail.com',
  phone: '+919400060273',
  location: 'Sharjah, United Arab Emirates',
  availability: 'UAE resident — available immediately',
  cv_path: path.join(__dirname, 'output/sradha-n-cv.pdf'),
};

// ── UAE Greenhouse boards to scan ─────────────────────────────────
const UAE_BOARDS = [
  { name: 'Property Finder',  board: 'propertyfinder' },
  { name: 'Careem',           board: 'careem' },
  { name: 'Tabby',            board: 'tabby' },
  { name: 'Anghami',          board: 'anghami' },
  { name: 'Fetchr',           board: 'fetchr' },
  { name: 'Noon',             board: 'noon' },
  { name: 'Talabat',          board: 'talabat' },
  { name: 'Swvl',             board: 'swvl' },
  { name: 'Pure Harvest',     board: 'pureharvestsmartagriculture' },
  { name: 'Kitopi',           board: 'kitopi' },
  { name: 'Sarwa',            board: 'sarwa' },
  { name: 'YAP',              board: 'yap' },
  { name: 'Stake',            board: 'stake' },
  { name: 'Huspy',            board: 'huspy' },
  { name: 'Bayt',             board: 'baytcom' },
];

// ── Title filters (UAE entry-level) ───────────────────────────────
const POSITIVE = [
  'intern', 'internship', 'trainee', 'graduate', 'entry',
  'junior', 'associate', 'analyst', 'coordinator',
];
const NEGATIVE = [
  'senior', 'lead', 'manager', 'director', 'head', 'vp',
  'principal', 'emirati', 'national', 'emiratization',
  '5+ years', '7+ years', '10+ years',
];

// ── Already applied (dedup) ───────────────────────────────────────
const SUBMITTED_LOG = 'data/greenhouse-submitted.tsv';

function loadSubmitted() {
  if (!existsSync(SUBMITTED_LOG)) return new Set();
  return new Set(
    readFileSync(SUBMITTED_LOG, 'utf-8')
      .split('\n').slice(1)
      .map(l => l.split('\t')[0]).filter(Boolean)
  );
}

function logSubmission(jobId, company, title, status) {
  if (!existsSync(SUBMITTED_LOG)) {
    writeFileSync(SUBMITTED_LOG, 'job_id\tcompany\ttitle\tstatus\tdate\n');
  }
  const date = new Date().toISOString().slice(0, 10);
  appendFileSync(SUBMITTED_LOG, `${jobId}\t${company}\t${title}\t${status}\t${date}\n`);
}

// ── Greenhouse API ────────────────────────────────────────────────
async function fetchJobs(board) {
  const url = `https://boards-api.greenhouse.io/v1/boards/${board}/jobs`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.jobs || [];
}

async function submitApplication(board, jobId, jobTitle, company, dryRun) {
  if (dryRun) {
    console.log(`  [DRY RUN] Would submit to ${company} — ${jobTitle}`);
    return 'dry-run';
  }

  if (!existsSync(CANDIDATE.cv_path)) {
    console.error(`  ✗ CV not found at ${CANDIDATE.cv_path} — run: node generate-pdf.mjs first`);
    return 'error-no-cv';
  }

  const applyUrl = `https://boards-api.greenhouse.io/v1/boards/${board}/jobs/${jobId}/applications`;

  const form = new FormData();
  form.append('first_name', CANDIDATE.first_name);
  form.append('last_name', CANDIDATE.last_name);
  form.append('email', CANDIDATE.email);
  form.append('phone', CANDIDATE.phone);

  // Attach CV as a Blob
  const cvBytes = readFileSync(CANDIDATE.cv_path);
  const cvBlob = new Blob([cvBytes], { type: 'application/pdf' });
  form.append('resume', cvBlob, 'Sradha-N-CV.pdf');

  // Cover note
  const coverText = `UAE resident based in Sharjah, available immediately. Electronics and Computer Engineering graduate (VIT, 2024) with production ML/AI experience at Regal Rexnord and an Investment Banking Operations certification (Imarticus). Built end-to-end data pipelines and automated executive reporting using Python and the OpenAI API. Published IEEE researcher. Eager to bring technical depth and analytical rigour to ${company}.`;
  const coverBlob = new Blob([coverText], { type: 'text/plain' });
  form.append('cover_letter', coverBlob, 'cover-letter.txt');

  try {
    const res = await fetch(applyUrl, { method: 'POST', body: form });
    const text = await res.text();
    if (res.ok || res.status === 201) {
      console.log(`  ✓ Applied — ${company}: ${jobTitle}`);
      return 'applied';
    } else {
      console.log(`  ✗ Failed (${res.status}) — ${company}: ${jobTitle}`);
      console.log(`    Response: ${text.slice(0, 200)}`);
      return `error-${res.status}`;
    }
  } catch (err) {
    console.log(`  ✗ Error — ${company}: ${jobTitle}: ${err.message}`);
    return 'error-network';
  }
}

function matchesFilter(title) {
  const lower = title.toLowerCase();
  const hasPositive = POSITIVE.some(k => lower.includes(k));
  const hasNegative = NEGATIVE.some(k => lower.includes(k));
  return hasPositive && !hasNegative;
}

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const singleBoard = args[args.indexOf('--board') + 1];
  const singleJob = args[args.indexOf('--job') + 1];

  console.log(`\n🚀 Greenhouse Application Bot — ${new Date().toISOString().slice(0, 10)}`);
  console.log(dryRun ? '   Mode: DRY RUN (no real submissions)\n' : '   Mode: LIVE\n');

  const submitted = loadSubmitted();
  const boards = singleBoard
    ? UAE_BOARDS.filter(b => b.board === singleBoard)
    : UAE_BOARDS;

  let totalFound = 0;
  let totalApplied = 0;
  let totalSkipped = 0;

  for (const { name, board } of boards) {
    let jobs;
    try {
      jobs = await fetchJobs(board);
    } catch (err) {
      console.log(`⚠  ${name}: ${err.message}`);
      continue;
    }

    const matching = singleJob
      ? jobs.filter(j => String(j.id) === String(singleJob))
      : jobs.filter(j => matchesFilter(j.title || ''));

    if (matching.length === 0) {
      console.log(`   ${name}: no matching roles`);
      continue;
    }

    console.log(`\n📋 ${name} — ${matching.length} matching role(s):`);
    totalFound += matching.length;

    for (const job of matching) {
      const jobId = String(job.id);
      const title = job.title || 'Unknown';
      const location = job.location?.name || '';

      if (submitted.has(jobId)) {
        console.log(`  ↩  Already applied — ${title}`);
        totalSkipped++;
        continue;
      }

      console.log(`  → ${title} ${location ? `(${location})` : ''}`);
      const status = await submitApplication(board, jobId, title, name, dryRun);

      if (!dryRun) {
        logSubmission(jobId, name, title, status);
        if (status === 'applied') {
          totalApplied++;
          // Respect rate limits
          await new Promise(r => setTimeout(r, 2000));
        }
      }
    }
  }

  console.log(`\n─────────────────────────────`);
  console.log(`Roles found:   ${totalFound}`);
  console.log(`Applied:       ${totalApplied}`);
  console.log(`Skipped:       ${totalSkipped}`);
  if (dryRun) console.log(`\nRe-run without --dry-run to submit for real.`);
}

main().catch(console.error);
