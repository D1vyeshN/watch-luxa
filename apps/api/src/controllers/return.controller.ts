import { Request, Response } from 'express';
import { returnService } from '@services/return.service';
import { sendSuccess, sendPaginated } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';
import { getPagination } from '@utils/pagination';
import { UnauthorizedError } from '@utils/AppError';

const getOwner = (req: Request) => ({
  userId: req.user?.userId,
  sessionId: req.sessionId,
});

export const returnController: any = {
  /**
   * POST /api/v1/returns
   * Submit a return request (guest or authenticated).
   */
  create: asyncHandler(async (req: Request, res: Response) => {
    const ret = await returnService.createReturn({
      owner: getOwner(req),
      ...req.body,
    });

    return sendSuccess(
      res,
      {
        id: ret._id,
        returnNumber: ret.returnNumber,
        status: ret.status,
        refundAmount: ret.refundAmount,
      },
      'Return request submitted',
      201
    );
  }),

  /**
   * GET /api/v1/returns/track/:returnNumber
   * Public tracking (email verification optional).
   */
  track: asyncHandler(async (req: Request, res: Response) => {
    const email = req.query.email as string | undefined;
    const ret = await returnService.trackReturn(
      String(req.params.returnNumber),
      email
    );
    return sendSuccess(res, ret, 'Return found');
  }),

  /**
   * GET /api/v1/returns/me
   * Authenticated user's returns.
   */
  myReturns: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.userId) {
      throw new UnauthorizedError('Authentication required');
    }

    const { page, limit, skip } = getPagination(req.query);
    const result = await returnService.getMyReturns(req.user.userId, {
      skip,
      limit,
    });

    return sendPaginated(res, result.data, result.total, page, limit);
  }),

  /**
   * GET /api/v1/returns/me/:id
   */
  myReturn: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.userId) {
      throw new UnauthorizedError('Authentication required');
    }
    const ret = await returnService.getMyReturn(
      req.user.userId,
      String(req.params.id)
    );
    return sendSuccess(res, ret, 'Return fetched');
  }),

  /**
   * PATCH /api/v1/returns/me/:id/cancel
   */
  cancelOwn: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.userId) {
      throw new UnauthorizedError('Authentication required');
    }
    const ret = await returnService.cancelOwnReturn(
      req.user.userId,
      String(req.params.id)
    );
    return sendSuccess(res, ret, 'Return cancelled');
  }),

  /**
   * PATCH /api/v1/returns/me/:id/shipped
   */
  markInTransit: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.userId) {
      throw new UnauthorizedError('Authentication required');
    }
    const ret = await returnService.markInTransit(
      req.user.userId,
      String(req.params.id)
    );
    return sendSuccess(res, ret, 'Return marked as shipped');
  }),
};
