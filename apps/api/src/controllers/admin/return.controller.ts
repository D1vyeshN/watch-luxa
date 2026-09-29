import { Request, Response } from 'express';
import { returnService } from '@services/return.service';
import { sendSuccess, sendPaginated } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';
import { getPagination } from '@utils/pagination';
import { UnauthorizedError } from '@utils/AppError';

const requireAdminId = (req: Request): string => {
  if (!req.user?.userId) throw new UnauthorizedError('Authentication required');
  return req.user.userId;
};

export const adminReturnController: any = {
  /**
   * GET /api/v1/admin/returns
   */
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip, sortBy, sortOrder } = getPagination(req.query);

    const filter: Record<string, unknown> = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.refundStatus) filter.refundStatus = req.query.refundStatus;
    if (req.query.search) {
      filter.$or = [
        { returnNumber: { $regex: String(req.query.search), $options: 'i' } },
        { orderNumber: { $regex: String(req.query.search), $options: 'i' } },
        { customerEmail: { $regex: String(req.query.search), $options: 'i' } },
      ];
    }

    const result = await returnService.listForAdmin(filter, {
      skip,
      limit,
      sort: { [sortBy]: sortOrder },
    });

    return sendPaginated(res, result.data, result.total, page, limit);
  }),

  /**
   * GET /api/v1/admin/returns/:id
   */
  getById: asyncHandler(async (req: Request, res: Response) => {
    const ret = await returnService.adminGetById(String(req.params.id));
    return sendSuccess(res, ret, 'Return fetched');
  }),

  /**
   * PATCH /api/v1/admin/returns/:id/approve
   */
  approve: asyncHandler(async (req: Request, res: Response) => {
    const ret = await returnService.approve(
      String(req.params.id),
      requireAdminId(req),
      req.body.note
    );
    return sendSuccess(res, ret, 'Return approved');
  }),

  /**
   * PATCH /api/v1/admin/returns/:id/reject
   */
  reject: asyncHandler(async (req: Request, res: Response) => {
    const ret = await returnService.reject(
      String(req.params.id),
      requireAdminId(req),
      req.body.reason
    );
    return sendSuccess(res, ret, 'Return rejected');
  }),

  /**
   * PATCH /api/v1/admin/returns/:id/received
   */
  markReceived: asyncHandler(async (req: Request, res: Response) => {
    const ret = await returnService.markReceived(
      String(req.params.id),
      requireAdminId(req),
      req.body.note
    );
    return sendSuccess(res, ret, 'Return marked as received');
  }),

  /**
   * PATCH /api/v1/admin/returns/:id/refund
   */
  refund: asyncHandler(async (req: Request, res: Response) => {
    const ret = await returnService.refund(
      String(req.params.id),
      requireAdminId(req),
      req.body
    );
    return sendSuccess(res, ret, 'Refund processed and stock restored');
  }),
};
