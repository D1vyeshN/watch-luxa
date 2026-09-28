import { Request, Response } from 'express';
import { reviewService } from '@services/review.service';
import { sendSuccess, sendPaginated } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';
import { getPagination } from '@utils/pagination';
import { UnauthorizedError } from '@utils/AppError';

const requireUserId = (req: Request): string => {
  if (!req.user?.userId) throw new UnauthorizedError('Authentication required');
  return req.user.userId;
};

export const reviewController: any = {
  /**
   * GET /api/v1/reviews/product/:productId
   */
  listForProduct: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip } = getPagination(req.query);
    const sortBy = (req.query.sortBy as any) || 'recent';

    const result = await reviewService.listForProduct(
      String(req.params.productId),
      { skip, limit },
      sortBy
    );

    return sendPaginated(res, result.data, result.total, page, limit);
  }),

  /**
   * GET /api/v1/reviews/product/:productId/summary
   */
  summary: asyncHandler(async (req: Request, res: Response) => {
    const summary = await reviewService.getRatingSummary(String(req.params.productId));
    return sendSuccess(res, summary, 'Rating summary');
  }),

  /**
   * POST /api/v1/reviews
   */
  create: asyncHandler(async (req: Request, res: Response) => {
    const review = await reviewService.createReview(requireUserId(req), req.body);
    return sendSuccess(
      res,
      review,
      'Review submitted for moderation',
      201
    );
  }),

  /**
   * PUT /api/v1/reviews/:id
   */
  update: asyncHandler(async (req: Request, res: Response) => {
    const review = await reviewService.updateReview(
      requireUserId(req),
      String(req.params.id),
      req.body
    );
    return sendSuccess(res, review, 'Review updated');
  }),

  /**
   * DELETE /api/v1/reviews/:id
   */
  delete: asyncHandler(async (req: Request, res: Response) => {
    await reviewService.deleteOwnReview(requireUserId(req), String(req.params.id));
    return sendSuccess(res, null, 'Review deleted');
  }),

  /**
   * POST /api/v1/reviews/:id/helpful
   */
  helpful: asyncHandler(async (req: Request, res: Response) => {
    const review = await reviewService.markHelpful(
      String(req.params.id),
      requireUserId(req)
    );
    return sendSuccess(
      res,
      { helpfulCount: review.helpfulCount },
      'Marked as helpful'
    );
  }),

  /**
   * POST /api/v1/reviews/:id/report
   */
  report: asyncHandler(async (req: Request, res: Response) => {
    await reviewService.report(String(req.params.id));
    return sendSuccess(res, null, 'Review reported');
  }),

  /**
   * GET /api/v1/reviews/me
   */
  myReviews: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip } = getPagination(req.query);
    const result = await reviewService.listMyReviews(requireUserId(req), {
      skip,
      limit,
    });
    return sendPaginated(res, result.data, result.total, page, limit);
  }),

  /**
   * GET /api/v1/reviews/me/product/:productId
   */
  myReviewForProduct: asyncHandler(async (req: Request, res: Response) => {
    const review = await reviewService.getMyReviewForProduct(
      requireUserId(req),
      String(req.params.productId)
    );
    return sendSuccess(res, review, review ? 'Review found' : 'No review yet');
  }),
};
