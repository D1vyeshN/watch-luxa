import { Request, Response } from 'express';
import { reviewService } from '@services/review.service';
import { sendSuccess, sendPaginated } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';
import { getPagination } from '@utils/pagination';
import { UnauthorizedError } from '@utils/AppError';

const requireAdminId = (req: Request): string => {
  if (!req.user?.userId) throw new UnauthorizedError('Authentication required');
  return req.user.userId;
};

export const adminReviewController: any = {
  /**
   * GET /api/v1/admin/reviews
   */
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip, sortBy, sortOrder } = getPagination(req.query);

    const filter: Record<string, unknown> = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.productId) filter.productId = req.query.productId;
    if (req.query.rating) filter.rating = Number(req.query.rating);
    if (req.query.search) {
      filter.$or = [
        { comment: { $regex: String(req.query.search), $options: 'i' } },
        { title: { $regex: String(req.query.search), $options: 'i' } },
      ];
    }

    const result = await reviewService.listForAdmin(filter, {
      skip,
      limit,
      sort: { [sortBy]: sortOrder },
    });

    return sendPaginated(res, result.data, result.total, page, limit);
  }),

  /**
   * PATCH /api/v1/admin/reviews/:id/approve
   */
  approve: asyncHandler(async (req: Request, res: Response) => {
    const review = await reviewService.approve(
      String(req.params.id),
      requireAdminId(req)
    );
    return sendSuccess(res, review, 'Review approved');
  }),

  /**
   * PATCH /api/v1/admin/reviews/:id/reject
   */
  reject: asyncHandler(async (req: Request, res: Response) => {
    const review = await reviewService.reject(
      String(req.params.id),
      requireAdminId(req),
      req.body.reason
    );
    return sendSuccess(res, review, 'Review rejected');
  }),

  /**
   * DELETE /api/v1/admin/reviews/:id
   */
  delete: asyncHandler(async (req: Request, res: Response) => {
    await reviewService.adminDelete(String(req.params.id));
    return sendSuccess(res, null, 'Review deleted');
  }),

  /**
   * POST /api/v1/admin/reviews/:id/reply
   */
  reply: asyncHandler(async (req: Request, res: Response) => {
    const review = await reviewService.reply(
      String(req.params.id),
      requireAdminId(req),
      req.body.text
    );
    return sendSuccess(res, review, 'Reply posted');
  }),

  /**
   * DELETE /api/v1/admin/reviews/:id/reply
   */
  removeReply: asyncHandler(async (req: Request, res: Response) => {
    const review = await reviewService.removeReply(String(req.params.id));
    return sendSuccess(res, review, 'Reply removed');
  }),
};
