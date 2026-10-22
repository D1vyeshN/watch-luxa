import { Request, Response } from 'express';
import { Product } from '@models/product.model';
import { Brand } from '@models/brand.model';
import { Category } from '@models/category.model';
import { Collection } from '@models/collection.model';
import { sendSuccess } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';
import {
  toStorefrontProduct,
  toStorefrontBrand,
  toStorefrontCategory,
  toStorefrontCollection,
} from '@utils/storefrontFilters';
import { cacheGet, cacheSet } from '@utils/cache';
import { homepageService } from '@services/homepage.service';

// Each rail returns RAIL_SIZE products; fetch extra so duplicates can be skipped
const RAIL_SIZE = 8;
const RAIL_FETCH = 16;

/**
 * Picks up to RAIL_SIZE products, preferring ones not already shown in an
 * earlier rail. Falls back to repeats rather than leaving a rail short.
 */
function pickUnique<T extends { _id: unknown }>(products: T[], seen: Set<string>): T[] {
  const fresh = products.filter((p) => !seen.has(String(p._id)));
  const repeats = products.filter((p) => seen.has(String(p._id)));
  const picked = [...fresh, ...repeats].slice(0, RAIL_SIZE);
  picked.forEach((p) => seen.add(String(p._id)));
  return picked;
}

export const storefrontHomeController: Record<string, any> = {
  /**
   * GET /api/v1/home
   * Single aggregate call for the entire homepage.
   * Reduces 6+ requests to 1.
   */
  index: asyncHandler(async (_req: Request, res: Response) => {
    const cacheKey = 'home:aggregate';
    const cached = await cacheGet<unknown>(cacheKey);
    if (cached) return sendSuccess(res, cached, 'Home data fetched');

    const [
      featured,
      newArrivals,
      trending,
      categories,
      featuredBrands,
      featuredCollections,
      hero,
      sections,
    ] = await Promise.all([
      Product.find({
        status: 'active',
        featured: true,
        'variants.isActive': true,
      })
        .limit(RAIL_FETCH)
        .sort({ createdAt: -1 })
        .populate('brandId', 'name slug logo')
        .lean(),

      Product.find({
        status: 'active',
        'variants.isActive': true,
      })
        .limit(RAIL_FETCH)
        .sort({ publishedAt: -1, createdAt: -1 })
        .populate('brandId', 'name slug logo')
        .lean(),

      Product.find({
        status: 'active',
        soldCount: { $gt: 0 },
        'variants.isActive': true,
      })
        .limit(RAIL_FETCH)
        .sort({ soldCount: -1 })
        .populate('brandId', 'name slug logo')
        .lean(),

      Category.find({ status: 'active' })
        .sort({ displayOrder: 1 })
        .limit(10)
        .lean(),

      Brand.find({ status: 'active', featured: true })
        .sort({ name: 1 })
        .limit(8)
        .lean(),

      Collection.find({ status: 'active', featured: true })
        .sort({ displayOrder: 1 })
        .limit(4)
        .lean(),

      homepageService.getStorefrontHero(),
      homepageService.getStorefrontSections(),
    ]);

    // Rails render top to bottom in this order, so earlier ones win a product
    const seen = new Set<string>();
    const featuredPicked = pickUnique(featured, seen);
    const newArrivalsPicked = pickUnique(newArrivals, seen);
    const trendingPicked = pickUnique(trending, seen);

    const result = {
      hero,
      sections,
      featured: featuredPicked.map((p) => toStorefrontProduct(p, false)),
      newArrivals: newArrivalsPicked.map((p) => toStorefrontProduct(p, false)),
      trending: trendingPicked.map((p) => toStorefrontProduct(p, false)),
      categories: categories.map(toStorefrontCategory),
      brands: featuredBrands.map((b) => toStorefrontBrand(b, false)),
      collections: featuredCollections.map(toStorefrontCollection),
    };

    await cacheSet(cacheKey, result, 300); // 5 minutes

    return sendSuccess(res, result, 'Home data fetched');
  }),
};
