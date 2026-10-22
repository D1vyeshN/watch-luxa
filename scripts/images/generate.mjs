#!/usr/bin/env node
// Generate site imagery with Cloudflare Workers AI (FLUX.2 [dev] by default).
// https://developers.cloudflare.com/workers-ai/models/flux-2-dev/
//
// Usage (from repo root):
//   node scripts/images/generate.mjs --list                    list manifest entries
//   node scripts/images/generate.mjs                           generate every missing image
//   node scripts/images/generate.mjs --only hero-1,maison      generate specific entries
//   node scripts/images/generate.mjs --only hero-1 --force     regenerate (overwrite)
//   node scripts/images/generate.mjs --dry-run                 print requests, call nothing
//   node scripts/images/generate.mjs --prompt "..." --out apps/web/public/images/x.jpg [--aspect 16:9] [--no-style]
//
// Needs CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_AI_TOKEN (an API token with the
// "Workers AI" permission) in the repo-root .env (gitignored) or the environment.
//
// Entries live in prompts.json next to this file. Each entry can set `model`,
// `aspect_ratio`, `style`, `seed`, `steps`, `guidance` and `references`
// (local paths or URLs, up to 4) — the model sees them as image 0..3 — and
// `replace` (the current file is a placeholder: regenerate it once).
// Every result is saved as a JPEG.

import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const MAX_REFERENCES = 4;
const REFERENCE_MAX_PX = 511; // the model needs reference images under 512×512
const JPEG_QUALITY = 88;

// sharp is a dependency of the API app; borrow it rather than adding a root package
const sharp = createRequire(resolve(ROOT, 'apps/api/package.json'))('sharp');

// width × height per aspect ratio. Sized to stay on the Workers AI free tier:
// FLUX.2 bills per 512×512 tile (and per step), so these keep each image to
// 4–6 tiles — about half the cost of full resolution. Multiples of 16.
const SIZES = {
  '1:1': [1024, 1024], // 4 tiles
  '16:9': [1536, 864], // 6
  '21:9': [1536, 656], // 6
  '9:16': [864, 1536], // 6
  '4:5': [1024, 1280], // 6
  '3:4': [960, 1280], // 6
  '3:2': [1536, 1024], // 6
  '2:1': [1536, 768], // 6
};

// Ids this script has generated. An entry marked "replace": true (its file is
// a placeholder) is regenerated once, then skipped like any other.
const LEDGER = resolve(HERE, 'out/ledger.json');
const readLedger = () => readFile(LEDGER, 'utf8').then(JSON.parse, () => ({}));

// The free tier refuses work once the daily allowance is spent (it never bills)
const isDailyLimit = (err) => /daily free allocation/i.test(err.message);

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

// ─── Workers AI ───

async function referenceBlob(ref) {
  const buffer = /^https?:\/\//.test(ref)
    ? Buffer.from(await (await fetch(ref)).arrayBuffer())
    : await readFile(resolve(ROOT, ref));
  const png = await sharp(buffer)
    .resize(REFERENCE_MAX_PX, REFERENCE_MAX_PX, { fit: 'inside' })
    .png()
    .toBuffer();
  return new Blob([png], { type: 'image/png' });
}

async function runModel(model, fields, references) {
  // FLUX.2 takes multipart form data, even for a prompt alone
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) form.append(key, String(value));
  }
  for (const [i, ref] of references.entries()) {
    form.append(`input_image_${i}`, await referenceBlob(ref), `reference-${i}.png`);
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/${model}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_AI_TOKEN}` },
    body: form,
  });

  const body = await res.text();
  let json;
  try {
    json = JSON.parse(body);
  } catch {
    throw new Error(`${model} → ${res.status}: ${body.slice(0, 300)}`);
  }
  if (!res.ok || json.success === false) {
    const errors = (json.errors ?? []).map((e) => e.message).join('; ');
    throw new Error(`${model} → ${res.status}: ${errors || body.slice(0, 300)}`);
  }

  const image = json.result?.image;
  if (!image) throw new Error(`${model} returned no image`);
  return Buffer.from(image, 'base64');
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

function buildRequest(entry, defaults) {
  const aspect = entry.aspect_ratio ?? defaults.aspect_ratio;
  const size = SIZES[aspect];
  if (!size) throw new Error(`${entry.id}: unsupported aspect ratio "${aspect}" (use ${Object.keys(SIZES).join(', ')})`);

  const references = entry.references ?? [];
  if (references.length > MAX_REFERENCES) {
    throw new Error(`${entry.id}: at most ${MAX_REFERENCES} references`);
  }

  return {
    model: entry.model ?? defaults.model,
    aspect,
    references,
    fields: {
      prompt: [entry.prompt, resolveStyle(entry, defaults)].filter(Boolean).join('\n\n'),
      width: size[0],
      height: size[1],
      seed: entry.seed,
      steps: entry.steps ?? defaults.steps,
      guidance: entry.guidance ?? defaults.guidance,
    },
  };
}

async function generate(entry, defaults, { dryRun }) {
  const { model, aspect, references, fields } = buildRequest(entry, defaults);
  const out = resolve(ROOT, entry.out);

  console.log(`\n▶ ${entry.id}  [${model}, ${aspect} → ${fields.width}×${fields.height}]  → ${entry.out}`);
  if (dryRun) {
    console.log(JSON.stringify({ ...fields, references }, null, 2));
    return;
  }

  for (const ref of references) {
    if (!/^https?:\/\//.test(ref) && !(await exists(resolve(ROOT, ref)))) {
      throw new Error(`reference ${ref} doesn't exist yet — generate it first`);
    }
  }

  const started = Date.now();
  const raw = await runModel(model, fields, references);
  const jpeg = await sharp(raw).jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();

  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, jpeg);
  console.log(`  ✓ saved ${entry.out} (${Math.round(jpeg.length / 1024)} KB, ${((Date.now() - started) / 1000).toFixed(1)}s)`);
}

async function main() {
  await loadDotEnv();
  const { flags, opts } = parseArgs(process.argv.slice(2));
  const manifest = JSON.parse(await readFile(resolve(HERE, 'prompts.json'), 'utf8'));
  const { defaults } = manifest;

  if (flags.has('list')) {
    for (const e of manifest.images) {
      const done = (await exists(resolve(ROOT, e.out))) ? '✓' : ' ';
      console.log(`${done} ${e.id.padEnd(34)} ${e.out}`);
    }
    return;
  }

  const dryRun = flags.has('dry-run');
  if (!dryRun) {
    const missing = ['CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_AI_TOKEN'].filter((k) => !process.env[k]);
    if (missing.length) {
      console.error(`${missing.join(' and ')} not set. Add them to the repo-root .env.`);
      process.exit(1);
    }
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
      const unknown = only.filter((id) => !manifest.images.some((e) => e.id === id));
      if (unknown.length) throw new Error(`unknown id(s): ${unknown.join(', ')}`);
    }
    if (opts.model) queue = queue.map((e) => ({ ...e, model: opts.model }));
  }

  const force = flags.has('force') || Boolean(opts.prompt);
  const ledger = await readLedger();
  let failed = 0;
  let made = 0;
  // Sequential on purpose: a product's second shot references its first
  for (const [i, entry] of queue.entries()) {
    const isPlaceholder = entry.replace && !ledger[entry.id];
    if (!force && !isPlaceholder && (await exists(resolve(ROOT, entry.out)))) {
      console.log(`· skip ${entry.id} (exists — use --force to regenerate)`);
      continue;
    }
    try {
      await generate(entry, defaults, { dryRun });
      if (!dryRun) {
        made++;
        ledger[entry.id] = new Date().toISOString();
        await mkdir(dirname(LEDGER), { recursive: true });
        await writeFile(LEDGER, JSON.stringify(ledger, null, 2));
      }
    } catch (err) {
      if (isDailyLimit(err)) {
        console.error(`\n■ Daily free allowance used up after ${made} image(s); ${queue.length - i} left in this run.`);
        console.error('  Run the same command again after 00:00 UTC — finished images are skipped.');
        process.exit(2);
      }
      failed++;
      console.error(`  ✗ ${entry.id}: ${err.message}`);
    }
  }
  console.log(`\nDone: ${made} generated, ${failed} failed.`);
  if (failed) process.exit(1);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
