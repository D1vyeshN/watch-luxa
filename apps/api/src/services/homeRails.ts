import { Types } from 'mongoose';
import { Product } from '@models/product.model';
import { Collection } from '@models/collection.model';
import '@models/brand.model'; // registers Brand for populate('brandId')
import type { HomeSection } from '@models/homepageSections';
import { buildPublicProductFilter, toStorefrontProduct } from '@utils/storefrontFilters';

type RailSection = Extract<HomeSection, { type: 'productRail' }>;
type ProductDoc = { _id: Types.ObjectId } & Record<string, unknown>;

// Automatic rails fetch spares so a product already shown higher up can be skipped
const SPARES = 8;
const POPULATE = ['brandId', 'name slug logo'] as const;

/** Products in the given id order (curated collections, hand-picked rails) */
async function byIdsInOrder(ids: (string | Types.ObjectId)[]): Promise<ProductDoc[]> {
  if (ids.length === 0) return [];
  const docs = await Product.find(buildPublicProductFilter({ ids: ids.map(String).join(',') }))
    .populate(...POPULATE)
    .lean<ProductDoc[]>();
  const byId = new Map(docs.map((d) => [String(d._id), d]));
  return ids.map((id) => byId.get(String(id))).filter((d): d is ProductDoc => Boolean(d));
}

async function candidates(rail: RailSection): Promise<ProductDoc[]> {
  const fetch = rail.limit + SPARES;
  const base = buildPublicProductFilter({});

  switch (rail.source) {
    case 'featured':
      return Product.find({ ...base, featured: true })
        .sort({ createdAt: -1 })
        .limit(fetch)
        .populate(...POPULATE)
        .lean<ProductDoc[]>();

    case 'newest':
      return Product.find(base)
        .sort({ publishedAt: -1, createdAt: -1 })
        .limit(fetch)
        .populate(...POPULATE)
        .lean<ProductDoc[]>();

    case 'bestselling':
      return Product.find({ ...base, soldCount: { $gt: 0 } })
        .sort({ soldCount: -1 })
        .limit(fetch)
        .populate(...POPULATE)
        .lean<ProductDoc[]>();

    case 'collection': {
      // A collection's own (curated) order; inactive collections show nothing
      const collection = await Collection.findOne({ _id: rail.collectionId, status: 'active' })
        .select('productIds')
        .lean<{ productIds?: Types.ObjectId[] }>();
      return byIdsInOrder((collection?.productIds ?? []).slice(0, fetch));
    }

    case 'manual':
      return byIdsInOrder(rail.productIds ?? []);
  }
}

/**
 * Fills each product rail with storefront products, top to bottom. Automatic
 * rails prefer products no earlier rail has shown (falling back to repeats
 * rather than running short); hand-picked rails show exactly what was picked.
 * Other sections pass through unchanged.
 */
export async function resolveHomeSections(sections: HomeSection[]) {
  const rails = sections.filter((s): s is RailSection => s.type === 'productRail');
  // Fetch in parallel; dedupe afterwards in page order
  const fetched = new Map(await Promise.all(rails.map(async (r) => [r.id, await candidates(r)] as const)));

  const seen = new Set<string>();
  return sections.map((section) => {
    if (section.type !== 'productRail') return section;

    const pool = fetched.get(section.id) ?? [];
    const picked =
      section.source === 'manual'
        ? pool.slice(0, section.limit)
        : [
            ...pool.filter((p) => !seen.has(String(p._id))),
            ...pool.filter((p) => seen.has(String(p._id))),
          ].slice(0, section.limit);
    picked.forEach((p) => seen.add(String(p._id)));

    return { ...section, products: picked.map((p) => toStorefrontProduct(p, false)) };
  });
}
