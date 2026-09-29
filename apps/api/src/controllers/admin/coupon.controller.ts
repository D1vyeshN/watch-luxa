import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { couponService } from '@services/coupon.service';
import { sendSuccess, sendPaginated } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';
import { getPagination } from '@utils/pagination';
import { UnauthorizedError } from '@utils/AppError';

const requireAdminId = (req: Request): string => {
  if (!req.user?.userId) throw new UnauthorizedError('Authentication required');
  return req.user.userId;
};

const requireAdminObjectId = (req: Request): Types.ObjectId | string => {
  if (!req.user?.userId) throw new UnauthorizedError('Authentication required');
  // Handle super admin case - return string instead of ObjectId
  if (req.user.userId === 'superadmin') return req.user.userId;
  return new Types.ObjectId(req.user.userId);
};

export const adminCouponController: any = {
  /**
   * GET /api/v1/admin/coupons
   */
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip, sortBy, sortOrder } = getPagination(req.query);

    const filter: Record<string, unknown> = {};
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    if (req.query.autoApply !== undefined) {
      filter.autoApply = req.query.autoApply === 'true';
    }
    if (req.query.search) {
      filter.code = {
        $regex: String(req.query.search).toUpperCase(),
        $options: 'i',
      };
    }

    const result = await couponService.list(filter, {
      skip,
      limit,
      sort: { [sortBy]: sortOrder },
    });

    return sendPaginated(res, result.data, result.total, page, limit);
  }),

  /**
   * GET /api/v1/admin/coupons/:id
   */
  getById: asyncHandler(async (req: Request, res: Response) => {
    const coupon = await couponService.getById(String(req.params.id));
    return sendSuccess(res, coupon, 'Coupon fetched');
  }),

  /**
   * POST /api/v1/admin/coupons
   */
  create: asyncHandler(async (req: Request, res: Response) => {
    const coupon = await couponService.create(req.body, requireAdminObjectId(req));
    return sendSuccess(res, coupon, 'Coupon created', 201);
  }),

  /**
   * PUT /api/v1/admin/coupons/:id
   */
  update: asyncHandler(async (req: Request, res: Response) => {
    const coupon = await couponService.update(String(req.params.id), req.body);
    return sendSuccess(res, coupon, 'Coupon updated');
  }),

  /**
   * PATCH /api/v1/admin/coupons/:id/deactivate
   */
  deactivate: asyncHandler(async (req: Request, res: Response) => {
    const coupon = await couponService.deactivate(String(req.params.id));
    return sendSuccess(res, coupon, 'Coupon deactivated');
  }),

  /**
   * PATCH /api/v1/admin/coupons/:id/reactivate
   */
  reactivate: asyncHandler(async (req: Request, res: Response) => {
    const coupon = await couponService.reactivate(String(req.params.id));
    return sendSuccess(res, coupon, 'Coupon reactivated');
  }),

  /**
   * DELETE /api/v1/admin/coupons/:id
   */
  delete: asyncHandler(async (req: Request, res: Response) => {
    await couponService.delete(String(req.params.id));
    return sendSuccess(res, null, 'Coupon deleted');
  }),
};
