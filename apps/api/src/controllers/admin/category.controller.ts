import { Request, Response } from 'express';
import { categoryService } from '@services/category.service';
import { sendSuccess, sendPaginated } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';
import { getPagination, buildFilters } from '@utils/pagination';
import { CategoryFindManyOptions } from '@repositories/category.repository';

export const adminCategoryController: any = {
  /**
   * GET /api/v1/admin/categories
   */
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip, sortBy, sortOrder } = getPagination(req.query);

    const filter = buildFilters(req.query, ['status', 'isSystem']);

    if (req.query.search) {
      filter.$text = { $search: String(req.query.search) };
    }

    const { data, total } = await categoryService.findMany(filter, {
      skip,
      limit,
      sort: { [sortBy]: sortOrder },
    } as CategoryFindManyOptions);

    const adminData = data.map((cat) => ({
      id: cat._id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image: cat.image,
      icon: cat.icon,
      displayOrder: cat.displayOrder,
      isSystem: cat.isSystem,
      status: cat.status,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    }));

    return sendPaginated(res, adminData, total, page, limit);
  }),

  /**
   * GET /api/v1/admin/categories/:id
   */
  getById: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.findById(req.params.id as string);
    return sendSuccess(res, category, 'Category fetched');
  }),

  /**
   * POST /api/v1/admin/categories
   */
  create: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.create(req.body);
    return sendSuccess(res, category, 'Category created', 201);
  }),

  /**
   * PUT /api/v1/admin/categories/:id
   */
  update: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.update(req.params.id as string, req.body);
    return sendSuccess(res, category, 'Category updated');
  }),

  /**
   * DELETE /api/v1/admin/categories/:id
   */
  archive: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.archive(req.params.id as string);
    return sendSuccess(res, category, 'Category archived');
  }),

  /**
   * PATCH /api/v1/admin/categories/:id/restore
   */
  restore: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.restore(req.params.id as string);
    return sendSuccess(res, category, 'Category restored');
  }),
};
