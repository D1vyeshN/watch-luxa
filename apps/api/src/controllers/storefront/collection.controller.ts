import { Request, Response } from 'express';
import { Collection } from '@models/collection.model';
import { Product } from '@models/product.model';
import { sendSuccess } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';
import {
  toStorefrontCollection,
  toStorefrontProduct,
} from '@utils/storefrontFilters';
import { NotFoundError } from '@utils/AppError';
import { cacheGet, cacheSet } from '@utils/cache';

export const storefrontCollectionController: Record<string, any> = {
  /**
   * GET /api/v1/collections
   * Active collections. Use ?featured=true for homepage.
   */
  list: asyncHandler(async (req: Request, res: Response) => {
    const featured = req.query.featured === 'true';

    const cacheKey = `collections:list:${featured}`;
    const cached = await cacheGet<unknown[]>(cacheKey);
    if (cached) return sendSuccess(res, cached, 'Collections fetched');

    const filter: Record<string, unknown> = { status: 'active' };
    if (featured) filter.featured = true;

    const collections = await Collection.find(filter)
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    const storefront = collections.map(toStorefrontCollection);

    await cacheSet(cacheKey, storefront, 600);

    return sendSuccess(res, storefront, 'Collections fetched');
  }),

  /**
   * GET /api/v1/collections/:slug
   * Collection detail with its products.
   */
  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;

    const cacheKey = `collection:${slug}`;
    const cached = await cacheGet<unknown>(cacheKey);
    if (cached) return sendSuccess(res, cached, 'Collection fetched');

    const collection = await Collection.findOne({
      slug,
      status: 'active',
    }).lean();
    if (!collection) throw new NotFoundError('Collection not found');

    // Get products either from manual productIds OR auto-rule
    let productFilter: Record<string, unknown> = {
      status: 'active',
      'variants.isActive': true,
    };

    if (collection.autoRule) {
      const { field, operator, value } = collection.autoRule;
      const fieldMap: Record<string, string> = {
        category: 'category',
        brandId: 'brandId',
        tags: 'tags',
        movement: 'variants.movement',
        gender: 'gender',
      };
      const targetField = fieldMap[field] || field;

      if (operator === 'equals') {
        productFilter[targetField] = value;
      } else if (operator === 'in' && Array.isArray(value)) {
        productFilter[targetField] = { $in: value };
      } else if (operator === 'contains' && typeof value === 'string') {
        productFilter[targetField] = { $in: [value] };
      }
    } else if (collection.productIds && collection.productIds.length > 0) {
      productFilter._id = { $in: collection.productIds };
    } else {
      // Empty collection — return with no products
      return sendSuccess(
        res,
        { ...toStorefrontCollection(collection), products: [] },
        'Collection fetched'
      );
    }

    const products = await Product.find(productFilter)
      .limit(24)
      .sort({ featured: -1, createdAt: -1 })
      .populate('brandId', 'name slug logo')
      .lean();

    const result = {
      ...toStorefrontCollection(collection),
      products: products.map((p) => toStorefrontProduct(p, false)),
    };

    await cacheSet(cacheKey, result, 300);

    return sendSuccess(res, result, 'Collection fetched');
  }),
};
