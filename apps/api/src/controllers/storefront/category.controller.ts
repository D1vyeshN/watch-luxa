import { Request, Response } from 'express';
import { Category } from '@models/category.model';
import { Product } from '@models/product.model';
import { sendSuccess } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';
import {
  toStorefrontCategory,
  toStorefrontProduct,
} from '@utils/storefrontFilters';
import { NotFoundError } from '@utils/AppError';
import { cacheGet, cacheSet } from '@utils/cache';

export const storefrontCategoryController: Record<string, any> = {
  /**
   * GET /api/v1/categories
   * All active categories, sorted by displayOrder.
   */
  list: asyncHandler(async (_req: Request, res: Response) => {
    const cacheKey = 'categories:all';
    const cached = await cacheGet<unknown[]>(cacheKey);
    if (cached) return sendSuccess(res, cached, 'Categories fetched');

    const categories = await Category.find({ status: 'active' })
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    const storefront = categories.map(toStorefrontCategory);

    await cacheSet(cacheKey, storefront, 3600); // 1 hour

    return sendSuccess(res, storefront, 'Categories fetched');
  }),

  /**
   * GET /api/v1/categories/:slug
   * Category detail with products.
   */
  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;

    const cacheKey = `category:${slug}`;
    const cached = await cacheGet<unknown>(cacheKey);
    if (cached) return sendSuccess(res, cached, 'Category fetched');

    const category = await Category.findOne({ slug, status: 'active' }).lean();
    if (!category) throw new NotFoundError('Category not found');

    const products = await Product.find({
      category: slug,
      status: 'active',
      'variants.isActive': true,
    })
      .limit(12)
      .sort({ featured: -1, createdAt: -1 })
      .populate('brandId', 'name slug logo')
      .lean();

    const result = {
      ...toStorefrontCategory(category),
      products: products.map((p) => toStorefrontProduct(p, false)),
    };

    await cacheSet(cacheKey, result, 600);

    return sendSuccess(res, result, 'Category fetched');
  }),
};
