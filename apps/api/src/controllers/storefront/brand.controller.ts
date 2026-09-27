import { Request, Response } from 'express';
import { Brand } from '@models/brand.model';
import { Product } from '@models/product.model';
import { sendSuccess, sendPaginated } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';
import { getPagination } from '@utils/pagination';
import { toStorefrontBrand, toStorefrontProduct } from '@utils/storefrontFilters';
import { NotFoundError } from '@utils/AppError';
import { cacheGet, cacheSet } from '@utils/cache';

export const storefrontBrandController: Record<string, any> = {
  /**
   * GET /api/v1/brands
   * Public list of active brands.
   */
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip } = getPagination(req.query);
    const featured = req.query.featured === 'true';

    const filter: Record<string, unknown> = { status: 'active' };
    if (featured) filter.featured = true;

    const cacheKey = `brands:list:${page}:${limit}:${featured}`;
    const cached = await cacheGet<{ data: unknown[]; total: number }>(cacheKey);
    if (cached) return sendPaginated(res, cached.data, cached.total, page, limit);

    const [data, total] = await Promise.all([
      Brand.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ featured: -1, name: 1 })
        .lean(),
      Brand.countDocuments(filter),
    ]);

    const storefront = data.map((b) => toStorefrontBrand(b, false));

    await cacheSet(cacheKey, { data: storefront, total }, 600);

    return sendPaginated(res, storefront, total, page, limit);
  }),

  /**
   * GET /api/v1/brands/:slug
   * Brand detail with heritage story and its products.
   */
  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;

    const cacheKey = `brand:${slug}`;
    const cached = await cacheGet<unknown>(cacheKey);
    if (cached) return sendSuccess(res, cached, 'Brand fetched');

    const brand = await Brand.findOne({ slug, status: 'active' }).lean();
    if (!brand) throw new NotFoundError('Brand not found');

    // Fetch top products from this brand
    const products = await Product.find({
      brandId: brand._id,
      status: 'active',
      'variants.isActive': true,
    })
      .limit(8)
      .sort({ featured: -1, soldCount: -1 })
      .populate('brandId', 'name slug logo')
      .lean();

    const result = {
      ...toStorefrontBrand(brand, true),
      products: products.map((p) => toStorefrontProduct(p, false)),
    };

    await cacheSet(cacheKey, result, 600);

    return sendSuccess(res, result, 'Brand fetched');
  }),
};
