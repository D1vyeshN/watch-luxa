import { Types } from 'mongoose';
import { Product } from '@models/product.model';
import { Collection } from '@models/collection.model';
import { cacheDelete, cacheDeletePattern } from '@utils/cache';

/**
 * Collections ↔ products is many-to-many and stored on both sides:
 * `Collection.productIds` (ordered — drives the storefront collection page)
 * and `Product.collectionIds` (shown on the product page / product form).
 * These helpers keep the two in step whenever either side changes.
 */

type Id = string | Types.ObjectId;

const toStrings = (ids: Id[] | undefined): string[] => (ids ?? []).map(String);

const diff = (prev: Id[] | undefined, next: Id[] | undefined) => {
  const before = new Set(toStrings(prev));
  const after = new Set(toStrings(next));
  return {
    added: [...after].filter((id) => !before.has(id)),
    removed: [...before].filter((id) => !after.has(id)),
  };
};

/** Dedupe (keeping first-seen order) and drop ids of products that don't exist. */
export async function existingProductIds(ids: Id[] | undefined): Promise<string[]> {
  const ordered = [...new Set(toStrings(ids))];
  if (ordered.length === 0) return [];
  const found = await Product.find({ _id: { $in: ordered } }).select('_id').lean();
  const exists = new Set(found.map((p) => String(p._id)));
  return ordered.filter((id) => exists.has(id));
}

/** A collection's product list changed → update each product's `collectionIds`. */
export async function syncProductsForCollection(
  collectionId: Id,
  prevProductIds: Id[] | undefined,
  nextProductIds: Id[] | undefined,
): Promise<void> {
  const { added, removed } = diff(prevProductIds, nextProductIds);
  await Promise.all([
    added.length &&
      Product.updateMany({ _id: { $in: added } }, { $addToSet: { collectionIds: collectionId } }),
    removed.length &&
      Product.updateMany({ _id: { $in: removed } }, { $pull: { collectionIds: collectionId } }),
  ]);
}

/** A product's `collectionIds` changed → add/remove it from those collections. */
export async function syncCollectionsForProduct(
  productId: Id,
  prevCollectionIds: Id[] | undefined,
  nextCollectionIds: Id[] | undefined,
): Promise<void> {
  const { added, removed } = diff(prevCollectionIds, nextCollectionIds);
  if (!added.length && !removed.length) return;
  await Promise.all([
    added.length &&
      Collection.updateMany({ _id: { $in: added } }, { $addToSet: { productIds: productId } }),
    removed.length &&
      Collection.updateMany({ _id: { $in: removed } }, { $pull: { productIds: productId } }),
  ]);
  await invalidateCollectionCaches();
}

/** Storefront caches that embed collection contents. */
export async function invalidateCollectionCaches(): Promise<void> {
  await Promise.all([
    cacheDeletePattern('collection:*'),
    cacheDeletePattern('collections:*'),
    cacheDelete('home:aggregate'),
  ]);
}
