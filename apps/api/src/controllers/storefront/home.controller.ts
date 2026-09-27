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
    ] = await Promise.all([
      Product.find({
        status: 'active',
        featured: true,
        'variants.isActive': true,
      })
        .limit(8)
        .sort({ createdAt: -1 })
        .populate('brandId', 'name slug logo')
        .lean(),

      Product.find({
        status: 'active',
        'variants.isActive': true,
      })
        .limit(8)
        .sort({ publishedAt: -1, createdAt: -1 })
        .populate('brandId', 'name slug logo')
        .lean(),

      Product.find({
        status: 'active',
        soldCount: { $gt: 0 },
        'variants.isActive': true,
      })
        .limit(8)
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
    ]);

    const result = {
      featured: featured.map((p) => toStorefrontProduct(p, false)),
      newArrivals: newArrivals.map((p) => toStorefrontProduct(p, false)),
      trending: trending.map((p) => toStorefrontProduct(p, false)),
      categories: categories.map(toStorefrontCategory),
      brands: featuredBrands.map((b) => toStorefrontBrand(b, false)),
      collections: featuredCollections.map(toStorefrontCollection),
    };

    await cacheSet(cacheKey, result, 300); // 5 minutes

    return sendSuccess(res, result, 'Home data fetched');
  }),
};
