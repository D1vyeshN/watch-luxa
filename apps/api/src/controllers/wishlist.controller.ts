import { Request, Response } from 'express';
import { wishlistService } from '@services/wishlist.service';
import { sendSuccess } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';
import { UnauthorizedError } from '@utils/AppError';

const requireUserId = (req: Request): string => {
  if (!req.user?.userId) {
    throw new UnauthorizedError('Authentication required');
  }
  return req.user.userId;
};

export const wishlistController: Record<string, any> = {
  /**
   * GET /api/v1/wishlist
   */
  get: asyncHandler(async (req: Request, res: Response) => {
    const wishlist = await wishlistService.getWishlist(requireUserId(req));
    return sendSuccess(res, wishlist, 'Wishlist fetched');
  }),

  /**
   * POST /api/v1/wishlist
   */
  add: asyncHandler(async (req: Request, res: Response) => {
    const result = await wishlistService.addProduct(
      requireUserId(req),
      req.body.productId
    );
    return sendSuccess(res, result, 'Added to wishlist', 201);
  }),

  /**
   * DELETE /api/v1/wishlist/:productId
   */
  remove: asyncHandler(async (req: Request, res: Response) => {
    const result = await wishlistService.removeProduct(
      requireUserId(req),
      req.params.productId as string
    );
    return sendSuccess(res, result, 'Removed from wishlist');
  }),

  /**
   * POST /api/v1/wishlist/toggle
   */
  toggle: asyncHandler(async (req: Request, res: Response) => {
    const result = await wishlistService.toggleProduct(
      requireUserId(req),
      req.body.productId
    );
    return sendSuccess(res, result, result.added ? 'Added' : 'Removed');
  }),

  /**
   * GET /api/v1/wishlist/check/:productId
   */
  check: asyncHandler(async (req: Request, res: Response) => {
    const result = await wishlistService.checkProduct(
      requireUserId(req),
      req.params.productId as string
    );
    return sendSuccess(res, result, 'Wishlist status');
  }),

  /**
   * DELETE /api/v1/wishlist
   */
  clear: asyncHandler(async (req: Request, res: Response) => {
    const result = await wishlistService.clear(requireUserId(req));
    return sendSuccess(res, result, 'Wishlist cleared');
  }),
};
