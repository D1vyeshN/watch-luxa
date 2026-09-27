import { Request, Response } from 'express';
import { Product } from '@models/product.model';
import { Brand } from '@models/brand.model';
import { sendSuccess, sendPaginated } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';
import { getPagination } from '@utils/pagination';
import {
  buildPublicProductFilter,
  toStorefrontProduct,
} from '@utils/storefrontFilters';
import { NotFoundError, BadRequestError } from '@utils/AppError';
import { cacheGet, cacheSet } from '@utils/cache';

export const storefrontProductController: Record<string, any> = {
  /**
   * GET /api/v1/products
   * Public product listing with filters, search, sort, pagination.
   */
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip, sortBy, sortOrder } = getPagination(req.query);

    // Handle brand slug → brandId conversion
    const query = { ...req.query } as Record<string, unknown>;
    if (query.brandSlug) {
      const brand = await Brand.findOne({ slug: query.brandSlug }).select('_id').lean();
      if (brand) {
        query.brandId = brand._id.toString();
      } else {
        // Brand doesn't exist — return empty
        return sendPaginated(res, [], 0, page, limit);
      }
    }

    const filter = buildPublicProductFilter(query);

    // Only admins can sort by soldCount, others by createdAt or price
    const allowedSorts = ['createdAt', 'basePrice', 'rating', 'soldCount'];
    const sortField = allowedSorts.includes(sortBy) ? sortBy : 'createdAt';

    // Cache key based on filter + pagination
    const cacheKey = `products:list:${JSON.stringify({ query, page, limit, sortField, sortOrder })}`;
    const cached = await cacheGet<{ data: unknown[]; total: number }>(cacheKey);
    if (cached) {
      return sendPaginated(res, cached.data, cached.total, page, limit);
    }

    const [data, total] = await Promise.all([
      Product.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ [sortField]: sortOrder })
        .populate('brandId', 'name slug logo')
        .lean(),
      Product.countDocuments(filter),
    ]);

    const storefrontData = data.map((p) => toStorefrontProduct(p, false));

    // Cache for 5 minutes
    await cacheSet(cacheKey, { data: storefrontData, total }, 300);

    return sendPaginated(res, storefrontData, total, page, limit);
  }),

  /**
   * GET /api/v1/products/:slug
   * Product detail with all variants.
   */
  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;

    const cacheKey = `product:${slug}`;
    const cached = await cacheGet<unknown>(cacheKey);
    if (cached) return sendSuccess(res, cached, 'Product fetched');

    const product = await Product.findOne({ slug, status: 'active' })
      .populate('brandId', 'name slug logo country founded')
      .populate('collectionIds', 'name slug')
      .lean();

    if (!product) throw new NotFoundError('Product not found');

    const storefront = toStorefrontProduct(product, true);

    await cacheSet(cacheKey, storefront, 600); // 10 minutes

    return sendSuccess(res, storefront, 'Product fetched');
  }),

  /**
   * GET /api/v1/products/:slug/related
   * Related products — same category, different product.
   */
  related: asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;
    const limit = Math.min(Number(req.query.limit) || 6, 12);

    const product = await Product.findOne({ slug, status: 'active' })
      .select('category brandId _id')
      .lean();

    if (!product) throw new NotFoundError('Product not found');

    const cacheKey = `products:related:${slug}:${limit}`;
    const cached = await cacheGet<unknown[]>(cacheKey);
    if (cached) return sendSuccess(res, cached, 'Related products');

    // Prefer same brand first, then same category
    const related = await Product.find({
      _id: { $ne: product._id },
      status: 'active',
      $or: [
        { brandId: product.brandId, category: product.category },
        { category: product.category },
        { brandId: product.brandId },
      ],
    })
      .limit(limit)
      .sort({ soldCount: -1, rating: -1 })
      .populate('brandId', 'name slug logo')
      .lean();

    const storefront = related.map((p) => toStorefrontProduct(p, false));

    await cacheSet(cacheKey, storefront, 300);

    return sendSuccess(res, storefront, 'Related products');
  }),

  /**
   * GET /api/v1/products/compare?ids=id1,id2,id3
   * Compare up to 4 products side by side.
   */
  compare: asyncHandler(async (req: Request, res: Response) => {
    const idsParam = req.query.ids;

    if (!idsParam || typeof idsParam !== 'string') {
      throw new BadRequestError('ids query parameter is required');
    }

    const ids = idsParam.split(',').map((s) => s.trim()).filter(Boolean);

    if (ids.length === 0) {
      throw new BadRequestError('At least one product ID is required');
    }

    if (ids.length > 4) {
      throw new BadRequestError('Maximum 4 products can be compared');
    }

    const products = await Product.find({
      _id: { $in: ids },
      status: 'active',
    })
      .populate('brandId', 'name slug logo')
      .lean();

    const storefront = products.map((p) => toStorefrontProduct(p, true));

    return sendSuccess(res, storefront, 'Products for comparison');
  }),

  /**
   * GET /api/v1/products/new-arrivals
   * Latest published products.
   */
  newArrivals: asyncHandler(async (req: Request, res: Response) => {
    const limit = Math.min(Number(req.query.limit) || 8, 20);

    const cacheKey = `products:new-arrivals:${limit}`;
    const cached = await cacheGet<unknown[]>(cacheKey);
    if (cached) return sendSuccess(res, cached, 'New arrivals');

    const products = await Product.find({
      status: 'active',
      'variants.isActive': true,
    })
      .limit(limit)
      .sort({ publishedAt: -1, createdAt: -1 })
      .populate('brandId', 'name slug logo')
      .lean();

    const storefront = products.map((p) => toStorefrontProduct(p, false));

    await cacheSet(cacheKey, storefront, 300);

    return sendSuccess(res, storefront, 'New arrivals');
  }),

  /**
   * GET /api/v1/products/featured
   * Featured products for homepage.
   */
  featured: asyncHandler(async (req: Request, res: Response) => {
    const limit = Math.min(Number(req.query.limit) || 8, 20);

    const cacheKey = `products:featured:${limit}`;
    const cached = await cacheGet<unknown[]>(cacheKey);
    if (cached) return sendSuccess(res, cached, 'Featured products');

    const products = await Product.find({
      status: 'active',
      featured: true,
      'variants.isActive': true,
    })
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('brandId', 'name slug logo')
      .lean();

    const storefront = products.map((p) => toStorefrontProduct(p, false));

    await cacheSet(cacheKey, storefront, 600);

    return sendSuccess(res, storefront, 'Featured products');
  }),

  /**
   * GET /api/v1/products/trending
   * Trending products based on soldCount.
   */
  trending: asyncHandler(async (req: Request, res: Response) => {
    const limit = Math.min(Number(req.query.limit) || 8, 20);

    const cacheKey = `products:trending:${limit}`;
    const cached = await cacheGet<unknown[]>(cacheKey);
    if (cached) return sendSuccess(res, cached, 'Trending products');

    const products = await Product.find({
      status: 'active',
      soldCount: { $gt: 0 },
      'variants.isActive': true,
    })
      .limit(limit)
      .sort({ soldCount: -1 })
      .populate('brandId', 'name slug logo')
      .lean();

    const storefront = products.map((p) => toStorefrontProduct(p, false));

    await cacheSet(cacheKey, storefront, 600);

    return sendSuccess(res, storefront, 'Trending products');
  }),
};
