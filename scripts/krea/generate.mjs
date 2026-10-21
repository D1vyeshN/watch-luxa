#!/usr/bin/env node
// Generate site imagery with the Krea API (https://www.krea.ai/docs).
//
// Usage (from repo root):
//   node scripts/krea/generate.mjs --list                  list manifest entries
//   node scripts/krea/generate.mjs                         generate every missing image
//   node scripts/krea/generate.mjs --only hero-1,heritage  generate specific entries
//   node scripts/krea/generate.mjs --only hero-1 --force   regenerate (overwrite)
//   node scripts/krea/generate.mjs --dry-run               print requests, call nothing
//   node scripts/krea/generate.mjs --prompt "..." --out apps/web/public/images/x.jpg [--aspect 16:9] [--model krea/krea-3]
//
// Needs KREA_API_KEY in the repo-root .env (gitignored) or the environment.
// Entries live in prompts.json next to this file. Each entry can set `model`,
// `aspect_ratio`, `resolution`, `seed` and `references` (local paths or URLs;
// local files are uploaded via POST /assets first).

import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const API = 'https://api.krea.ai';
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const TERMINAL = new Set(['completed', 'failed', 'cancelled']);
const JOB_TIMEOUT_MS = 10 * 60 * 1000;

// ─── args / env ───

function parseArgs(argv) {
  const args = { flags: new Set(), opts: {} };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) args.flags.add(key);
    else args.opts[key] = argv[++i];
  }
  return args;
}

async function loadDotEnv() {
  try {
    const text = await readFile(resolve(ROOT, '.env'), 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {
    // no .env — rely on the real environment
  }
}

const exists = (p) => access(p).then(() => true, () => false);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Krea API ───

async function krea(path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${process.env.KREA_API_KEY}`, ...init.headers },
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`${init.method ?? 'GET'} ${path} → ${res.status}: ${body.slice(0, 500)}`);
  return body ? JSON.parse(body) : {};
}

// Local references must be uploaded: image_urls caps each entry at 1024 chars,
// too short for a base64 data URI of any real photo.
const uploadCache = new Map();
async function resolveReference(ref) {
  if (/^https?:\/\//.test(ref)) return ref;
  const file = resolve(ROOT, ref);
  if (uploadCache.has(file)) return uploadCache.get(file);
  const form = new FormData();
  form.append('file', new Blob([await readFile(file)]), basename(file));
  const asset = await krea('/assets', { method: 'POST', body: form });
  console.log(`  uploaded reference ${ref} → ${asset.image_url}`);
  uploadCache.set(file, asset.image_url);
  return asset.image_url;
}

async function waitForJob(jobId) {
  const started = Date.now();
  let delay = 2000;
  let last = '';
  while (Date.now() - started < JOB_TIMEOUT_MS) {
    const job = await krea(`/jobs/${jobId}`);
    if (job.status !== last) {
      process.stdout.write(`  ${job.status}\n`);
      last = job.status;
    }
    if (TERMINAL.has(job.status)) return job;
    await sleep(delay);
    delay = Math.min(delay * 1.5, 8000);
  }
  throw new Error(`job ${jobId} timed out after ${JOB_TIMEOUT_MS / 1000}s`);
}

// ─── generation ───

// `style`: omitted → defaults.style, false → none, "name" → defaults.styles[name]
function resolveStyle(entry, defaults) {
  if (entry.style === false) return null;
  if (typeof entry.style === 'string') {
    const named = defaults.styles?.[entry.style];
    if (!named) throw new Error(`${entry.id}: unknown style "${entry.style}"`);
    return named;
  }
  return defaults.style;
}

function buildBody(entry, defaults) {
  const prompt = [entry.prompt, resolveStyle(entry, defaults)].filter(Boolean).join('\n\n');
  const body = {
    prompt,
    aspect_ratio: entry.aspect_ratio ?? defaults.aspect_ratio,
    resolution: entry.resolution ?? defaults.resolution,
  };
  if (entry.seed !== undefined) body.seed = entry.seed;
  return body;
}

async function generate(entry, defaults, { dryRun }) {
  const model = entry.model ?? defaults.model;
  const out = resolve(ROOT, entry.out);
  const body = buildBody(entry, defaults);

  console.log(`\n▶ ${entry.id}  [${model}, ${body.aspect_ratio}, ${body.resolution}]  → ${entry.out}`);
  if (dryRun) {
    console.log(JSON.stringify({ ...body, image_urls: entry.references }, null, 2));
    return;
  }

  if (entry.references?.length) body.image_urls = await Promise.all(entry.references.map(resolveReference));

  const created = await krea(`/generate/image/${model}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  console.log(`  job ${created.job_id}`);

  const job = await waitForJob(created.job_id);
  if (job.status !== 'completed') {
    throw new Error(`job ${job.job_id} ${job.status}: ${JSON.stringify(job.result?.error ?? job.result ?? {})}`);
  }

  const url = job.result?.urls?.[0];
  if (!url) throw new Error(`job ${job.job_id} completed without a result URL`);
  const img = await fetch(url);
  if (!img.ok) throw new Error(`download ${url} → ${img.status}`);

  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, Buffer.from(await img.arrayBuffer()));
  console.log(`  ✓ saved ${entry.out} (${img.headers.get('content-type')})`);
}

async function main() {
  await loadDotEnv();
  const { flags, opts } = parseArgs(process.argv.slice(2));
  const manifest = JSON.parse(await readFile(resolve(HERE, 'prompts.json'), 'utf8'));
  const { defaults } = manifest;

  if (flags.has('list')) {
    for (const e of manifest.images) {
      const done = (await exists(resolve(ROOT, e.out))) ? '✓' : ' ';
      console.log(`${done} ${e.id.padEnd(22)} ${e.out}`);
    }
    return;
  }

  const dryRun = flags.has('dry-run');
  if (!dryRun && !process.env.KREA_API_KEY) {
    console.error('KREA_API_KEY is not set. Add it to the repo-root .env.');
    process.exit(1);
  }

  // Ad-hoc one-off: --prompt "..." --out path
  let queue;
  if (opts.prompt) {
    if (!opts.out) throw new Error('--prompt needs --out <path>');
    queue = [{ id: 'adhoc', prompt: opts.prompt, out: opts.out, aspect_ratio: opts.aspect, model: opts.model, style: flags.has('no-style') ? false : undefined }];
  } else {
    const only = opts.only?.split(',').map((s) => s.trim());
    queue = manifest.images.filter((e) => !only || only.includes(e.id));
    if (only) {
      const missing = only.filter((id) => !manifest.images.some((e) => e.id === id));
      if (missing.length) throw new Error(`unknown id(s): ${missing.join(', ')}`);
    }
    if (opts.model) queue = queue.map((e) => ({ ...e, model: opts.model }));
  }

  const force = flags.has('force') || Boolean(opts.prompt);
  let failed = 0;
  for (const entry of queue) {
    if (!force && (await exists(resolve(ROOT, entry.out)))) {
      console.log(`· skip ${entry.id} (exists — use --force to regenerate)`);
      continue;
    }
    try {
      await generate(entry, defaults, { dryRun });
    } catch (err) {
      failed++;
      console.error(`  ✗ ${entry.id}: ${err.message}`);
    }
  }
  if (failed) process.exit(1);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
