import { Request, Response } from 'express';
import { brandService } from '@services/brand.service';
import { sendSuccess, sendPaginated } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';
import { getPagination } from '@utils/pagination';
import { buildFilters } from '@utils/pagination';

export const adminBrandController: any = {
  /**
   * GET /api/v1/admin/brands
   * List brands with filters, pagination, and search.
   */
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip, sortBy, sortOrder } = getPagination(req.query);

    // Build filter from query params
    const filter = buildFilters(req.query, ['status', 'featured']);

    // Full-text search
    if (req.query.search) {
      filter.$text = { $search: String(req.query.search) };
    }

    const { data, total } = await brandService.findMany(filter, {
      skip,
      limit,
      sort: { [sortBy]: sortOrder },
    });

    // Return full admin view
    const adminData = data.map((brand) => ({
      id: brand._id,
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo,
      country: brand.country,
      founded: brand.founded,
      // Short preview for the admin table — full story comes from GET /:id
      heritagePreview: brand.heritageStory?.slice(0, 160) || undefined,
      featured: brand.featured,
      status: brand.status,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
    }));

    return sendPaginated(res, adminData, total, page, limit);
  }),

  /**
   * GET /api/v1/admin/brands/:id
   * Get a single brand by ID with full details.
   */
  getById: asyncHandler(async (req: Request, res: Response) => {
    const brand = await brandService.findById(req.params.id as string);
    return sendSuccess(res, brand, 'Brand fetched');
  }),

  /**
   * POST /api/v1/admin/brands
   * Create a new brand.
   */
  create: asyncHandler(async (req: Request, res: Response) => {
    const brand = await brandService.create(req.body);
    return sendSuccess(res, brand, 'Brand created', 201);
  }),

  /**
   * PUT /api/v1/admin/brands/:id
   * Update an existing brand.
   */
  update: asyncHandler(async (req: Request, res: Response) => {
    const brand = await brandService.update(req.params.id as string, req.body);
    return sendSuccess(res, brand, 'Brand updated');
  }),

  /**
   * DELETE /api/v1/admin/brands/:id
   * Soft-delete (archive) a brand.
   */
  archive: asyncHandler(async (req: Request, res: Response) => {
    const brand = await brandService.archive(req.params.id as string);
    return sendSuccess(res, brand, 'Brand archived');
  }),

  /**
   * PATCH /api/v1/admin/brands/:id/restore
   * Restore an archived brand.
   */
  restore: asyncHandler(async (req: Request, res: Response) => {
    const brand = await brandService.restore(req.params.id as string);
    return sendSuccess(res, brand, 'Brand restored');
  }),
};
