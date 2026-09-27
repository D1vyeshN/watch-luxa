import { Request, Response } from 'express';
import { collectionService } from '@services/collection.service';
import { sendSuccess, sendPaginated } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';
import { getPagination, buildFilters } from '@utils/pagination';

const adminCollectionController: any = {
  /**
   * GET /api/v1/admin/collections
   * List collections with pagination, filtering, and sorting
   */
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip, sortBy, sortOrder } = getPagination(req.query);

    const filter = buildFilters(req.query, ['status', 'featured']);

    if (req.query.search) {
      filter.$text = { $search: String(req.query.search) };
    }

    const { data, total } = await collectionService.findMany(filter, {
      skip,
      limit,
      sort: { [sortBy]: sortOrder },
    });

    const adminFiltered = data.map(collection => ({
      id: collection._id,
      name: collection.name,
      slug: collection.slug,
      description: collection.description,
      image: collection.image,
      featured: collection.featured,
      displayOrder: collection.displayOrder,
      productCount: collection.productIds?.length || 0,
      hasAutoRule: Boolean(collection.autoRule),
      status: collection.status,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
    }));

    return sendPaginated(res, adminFiltered, total, page, limit);
  }),

  /**
   * GET /api/v1/admin/collections/:id
   * Get a single collection with all details
   */
  getById: asyncHandler(async (req: Request, res: Response) => {
    const collection = await collectionService.findById(req.params.id as string);
    return sendSuccess(res, collection, 'Collection fetched');
  }),

  /**
   * POST /api/v1/admin/collections
   * Create a new collection
   */
  create: asyncHandler(async (req: Request, res: Response) => {
    const collection = await collectionService.create(req.body);
    return sendSuccess(res, collection, 'Collection created', 201);
  }),

  /**
   * PUT /api/v1/admin/collections/:id
   * Update an existing collection
   */
  update: asyncHandler(async (req: Request, res: Response) => {
    const collection = await collectionService.update(req.params.id as string, req.body);
    return sendSuccess(res, collection, 'Collection updated');
  }),

  /**
   * DELETE /api/v1/admin/collections/:id
   * Archive a collection
   */
  archive: asyncHandler(async (req: Request, res: Response) => {
    const collection = await collectionService.archive(req.params.id as string);
    return sendSuccess(res, collection, 'Collection archived');
  }),

  /**
   * PATCH /api/v1/admin/collections/:id/restore
   * Restore an archived collection
   */
  restore: asyncHandler(async (req: Request, res: Response) => {
    const collection = await collectionService.restore(req.params.id as string);
    return sendSuccess(res, collection, 'Collection restored');
  }),

  /**
   * POST /api/v1/admin/collections/:id/products
   * Add products to a collection
   */
  addProducts: asyncHandler(async (req: Request, res: Response) => {
    const collection = await collectionService.addProducts(
      req.params.id as string,
      req.body.productIds
    );
    return sendSuccess(res, collection, 'Products added to collection');
  }),

  /**
   * DELETE /api/v1/admin/collections/:id/products
   * Remove products from a collection
   */
  removeProducts: asyncHandler(async (req: Request, res: Response) => {
    const collection = await collectionService.removeProducts(
      req.params.id as string,
      req.body.productIds
    );
    return sendSuccess(res, collection, 'Products removed from collection');
  }),
};

export { adminCollectionController };