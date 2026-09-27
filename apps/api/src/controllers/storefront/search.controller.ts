import { Request, Response } from 'express';
import { Product } from '@models/product.model';
import { Brand } from '@models/brand.model';
import { sendSuccess } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';
import { toStorefrontProduct } from '@utils/storefrontFilters';
import { cacheGet, cacheSet } from '@utils/cache';

export const storefrontSearchController: Record<string, any> = {
  /**
   * GET /api/v1/search?q=submariner
   * Full search across products and brands.
   */
  search: asyncHandler(async (req: Request, res: Response) => {
    const query = String(req.query.q || '').trim();

    if (!query) {
      return sendSuccess(res, { products: [], brands: [], total: 0 }, 'Empty search');
    }

    if (query.length < 2) {
      return sendSuccess(
        res,
        { products: [], brands: [], total: 0 },
        'Query too short'
      );
    }

    const cacheKey = `search:${query.toLowerCase()}`;
    const cached = await cacheGet<unknown>(cacheKey);
    if (cached) return sendSuccess(res, cached, 'Search results');

    const [products, brands] = await Promise.all([
      Product.find({
        status: 'active',
        'variants.isActive': true,
        $text: { $search: query },
      })
        .limit(20)
        .sort({ score: { $meta: 'textScore' } })
        .populate('brandId', 'name slug logo')
        .lean(),

      Brand.find({
        status: 'active',
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { country: { $regex: query, $options: 'i' } },
        ],
      })
        .limit(5)
        .lean(),
    ]);

    const result = {
      products: products.map((p) => toStorefrontProduct(p, false)),
      brands: brands.map((b) => ({
        id: b._id,
        name: b.name,
        slug: b.slug,
        logo: b.logo,
      })),
      total: products.length,
    };

    await cacheSet(cacheKey, result, 180); // 3 minutes

    return sendSuccess(res, result, 'Search results');
  }),

  /**
   * GET /api/v1/search/autocomplete?q=sub
   * Fast autocomplete for header search — returns 5 results with images.
   */
  autocomplete: asyncHandler(async (req: Request, res: Response) => {
    const query = String(req.query.q || '').trim();

    if (!query || query.length < 2) {
      return sendSuccess(res, { suggestions: [] }, 'No suggestions');
    }

    const cacheKey = `autocomplete:${query.toLowerCase()}`;
    const cached = await cacheGet<unknown[]>(cacheKey);
    if (cached) return sendSuccess(res, cached, 'Suggestions');

    const products = await Product.find({
      status: 'active',
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } },
      ],
    })
      .select('name slug heroImage basePrice brandId')
      .limit(5)
      .populate('brandId', 'name slug')
      .lean();

    const suggestions = products.map((p: any) => ({
      id: p._id,
      name: p.name,
      slug: p.slug,
      image: p.heroImage,
      price: p.basePrice,
      brand: p.brandId?.name || '',
    }));

    await cacheSet(cacheKey, suggestions, 300);

    return sendSuccess(res, suggestions, 'Suggestions');
  }),
};
