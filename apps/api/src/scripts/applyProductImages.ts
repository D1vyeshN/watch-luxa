// Upload generated studio shots (scripts/images/out/products/<slug>-1.jpg and
// -2.jpg) to Supabase and point each product at them.
//
//   npx tsx src/scripts/applyProductImages.ts --dry-run   show what would change
//   npx tsx src/scripts/applyProductImages.ts             upload + update
//
// Before anything changes, the current heroImage / images / variant images of
// every touched product are saved to
// scripts/images/out/product-images-backup-*.json, so it can be reverted.

import { readFile, writeFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { connectDB, disconnectDB } from '@config/database';
import { Product } from '@models/product.model';
import { storageService } from '@services/storage.service';
import { cacheDelete, cacheDeletePattern } from '@utils/cache';

const OUT = resolve(__dirname, '../../../../scripts/images/out/products');
const exists = (p: string) => access(p).then(() => true, () => false);

// The 8 catalogue products with generated shots (test products are left alone)
const SLUGS = [
  'submariner-date',
  'navitimer-b01',
  'royal-oak-15500',
  'nautilus-5711',
  'tank-louis-cartier',
  'presage-cocktail-time',
  'monaco-calibre-11',
  'speedmaster-professional',
];

function asUpload(buffer: Buffer, name: string): Express.Multer.File {
  return { buffer, mimetype: 'image/jpeg', originalname: name, size: buffer.length } as Express.Multer.File;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  // Every shot must exist before anything is uploaded or written
  const missing: string[] = [];
  for (const slug of SLUGS) {
    for (const n of [1, 2]) {
      if (!(await exists(resolve(OUT, `${slug}-${n}.jpg`)))) missing.push(`${slug}-${n}.jpg`);
    }
  }
  if (missing.length) throw new Error(`missing shots in ${OUT}: ${missing.join(', ')}`);

  await connectDB();

  const products = [];
  for (const slug of SLUGS) {
    const product = await Product.findOne({ slug });
    if (product) products.push(product);
    else console.log(`· ${slug}: not in the database, skipped`);
  }

  if (dryRun) {
    for (const p of products) console.log(`would update ${p.slug} (hero ${p.heroImage.slice(0, 70)}…)`);
    await disconnectDB();
    return;
  }

  // Back up first, so a failure halfway through is still reversible
  const backup = products.map((p) => ({
    slug: p.slug,
    heroImage: p.heroImage,
    images: p.images,
    variants: p.variants.map((v) => ({ sku: v.sku, images: v.images })),
  }));
  const backupFile = resolve(OUT, `../product-images-backup-${Date.now()}.json`);
  await writeFile(backupFile, JSON.stringify(backup, null, 2));
  console.log(`backup of current URLs: ${backupFile}\n`);

  for (const product of products) {
    const slug = product.slug;
    const [front, side] = await Promise.all(
      [1, 2].map(async (n) => {
        const buffer = await readFile(resolve(OUT, `${slug}-${n}.jpg`));
        return storageService.uploadImage(asUpload(buffer, `${slug}-${n}.jpg`), 'products', `${slug}-${n}`);
      })
    );

    product.heroImage = front.url;
    product.images = [front.url, side.url];
    // Variants that carried the old stock photo now show the new front shot
    for (const v of product.variants) {
      if (v.images?.length) v.images = [front.url];
    }
    await product.save();
    console.log(`✓ ${slug}: ${front.url}`);
  }

  // Listings, product pages and the homepage aggregate are cached in Redis
  await cacheDeletePattern('products:*');
  await cacheDelete('home:aggregate');

  await disconnectDB();
}

main().catch(async (err) => {
  console.error(err instanceof Error ? err.message : err);
  await disconnectDB().catch(() => {});
  process.exit(1);
});
