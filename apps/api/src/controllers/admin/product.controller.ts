import { Request, Response } from 'express';
import { productService } from '@services/product.service';
import { sendSuccess, sendPaginated } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';
import { getPagination, buildFilters } from '@utils/pagination';
import { BadRequestError } from '@utils/AppError';

export const adminProductController: any = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip, sortBy, sortOrder } = getPagination(req.query);

    const filter = buildFilters(req.query, [
      'status',
      'category',
      'brandId',
      'gender',
      'featured',
      'isLimitedEdition',
    ]);

    if (req.query.search) {
      filter.$text = { $search: String(req.query.search) };
    }

    if (req.query.minPrice || req.query.maxPrice) {
      (filter as any).basePrice = {};
      if (req.query.minPrice)
        (filter as any).basePrice.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice)
        (filter as any).basePrice.$lte = Number(req.query.maxPrice);
    }

    const { data, total } = await productService.findMany(filter, {
      skip,
      limit,
      sort: { [sortBy]: sortOrder },
    });

    const adminData = data.map((p: any) => ({
      id: p._id,
      name: p.name,
      slug: p.slug,
      brand: p.brandId,
      category: p.category,
      status: p.status,
      basePrice: p.basePrice,
      heroImage: p.heroImage,
      variantCount:
        p.variants?.filter((v: any) => v.isActive).length || 0,
      totalStock:
        p.variants?.reduce(
          (sum: number, v: any) => sum + (v.isActive ? v.stock : 0),
          0
        ) || 0,
      lowStockCount:
        p.variants?.filter(
          (v: any) =>
            v.isActive && v.stock > 0 && v.stock <= v.lowStockThreshold
        ).length || 0,
      featured: p.featured,
      isLimitedEdition: p.isLimitedEdition,
      soldCount: p.soldCount,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return sendPaginated(res, adminData, total, page, limit);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.findById(String(req.params.id));
    return sendSuccess(res, product, 'Product fetched');
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.create(req.body);
    return sendSuccess(res, product, 'Product created', 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.update(String(req.params.id), req.body);
    return sendSuccess(res, product, 'Product updated');
  }),

  archive: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.archive(String(req.params.id));
    return sendSuccess(res, product, 'Product archived');
  }),

  restore: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.restore(String(req.params.id));
    return sendSuccess(res, product, 'Product restored');
  }),

  publish: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.publish(String(req.params.id));
    return sendSuccess(res, product, 'Product published');
  }),

  addVariant: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.findById(String(req.params.id));
    const brandName = (product.brandId as any)?.name;

    if (!brandName) {
      throw new BadRequestError('Product has no brand');
    }

    const updated = await productService.addVariant(String(req.params.id), {
      ...req.body,
      brandName,
    });
    return sendSuccess(res, updated, 'Variant added', 201);
  }),

  updateVariant: asyncHandler(async (req: Request, res: Response) => {
    const updated = await productService.updateVariant(
      String(req.params.id),
      String(req.params.variantId),
      req.body
    );
    return sendSuccess(res, updated, 'Variant updated');
  }),

  removeVariant: asyncHandler(async (req: Request, res: Response) => {
    const updated = await productService.removeVariant(
      String(req.params.id),
      String(req.params.variantId)
    );
    return sendSuccess(res, updated, 'Variant removed');
  }),

  adjustStock: asyncHandler(async (req: Request, res: Response) => {
    const updated = await productService.adjustStock(
      String(req.params.id),
      String(req.params.variantId),
      req.body.adjustment
    );
    return sendSuccess(res, updated, 'Stock adjusted');
  }),

  setStock: asyncHandler(async (req: Request, res: Response) => {
    const updated = await productService.setStock(
      String(req.params.id),
      String(req.params.variantId),
      req.body.stock
    );
    return sendSuccess(res, updated, 'Stock updated');
  }),

  generateMatrix: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.findById(String(req.params.id));
    const brandName = (product.brandId as any)?.name;

    if (!brandName) {
      throw new BadRequestError('Product has no brand');
    }

    const result = await productService.generateVariantMatrix(
      String(req.params.id),
      req.body,
      brandName
    );

    return sendSuccess(res, result, `${result.created} variants created`, 201);
  }),

  inventory: asyncHandler(async (_req: Request, res: Response) => {
    const inventory = await productService.getInventoryFlat();
    return sendSuccess(res, inventory, 'Inventory fetched');
  }),
};
