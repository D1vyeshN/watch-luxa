import { Request, Response } from 'express';
import { cartService } from '@services/cart.service';
import { sendSuccess } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';
import { BadRequestError } from '@utils/AppError';

const getOwner = (req: Request) => ({
  userId: req.user?.userId,
  sessionId: req.sessionId,
});

export const cartController: Record<string, any> = {
  /**
   * GET /api/v1/cart
   */
  get: asyncHandler(async (req: Request, res: Response) => {
    const cart = await cartService.getCart(getOwner(req));
    return sendSuccess(res, cart, 'Cart fetched');
  }),

  /**
   * POST /api/v1/cart/items
   */
  addItem: asyncHandler(async (req: Request, res: Response) => {
    const cart = await cartService.addItem(getOwner(req), req.body);
    return sendSuccess(res, cart, 'Item added to cart', 201);
  }),

  /**
   * PATCH /api/v1/cart/items/:itemId
   */
  updateItem: asyncHandler(async (req: Request, res: Response) => {
    const cart = await cartService.updateItemQuantity(
      getOwner(req),
      req.params.itemId as string,
      req.body.quantity
    );
    return sendSuccess(res, cart, 'Cart updated');
  }),

  /**
   * DELETE /api/v1/cart/items/:itemId
   */
  removeItem: asyncHandler(async (req: Request, res: Response) => {
    const cart = await cartService.removeItem(
      getOwner(req),
      req.params.itemId as string
    );
    return sendSuccess(res, cart, 'Item removed');
  }),

  /**
   * DELETE /api/v1/cart
   */
  clear: asyncHandler(async (req: Request, res: Response) => {
    const cart = await cartService.clearCart(getOwner(req));
    return sendSuccess(res, cart, 'Cart cleared');
  }),

  /**
   * POST /api/v1/cart/merge
   * Called immediately after login. Requires auth + sessionId.
   */
  merge: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.userId) {
      throw new BadRequestError('Authentication required to merge cart');
    }

    const { sessionId } = req.body;
    const cart = await cartService.mergeCart(req.user.userId, sessionId);

    return sendSuccess(res, cart, 'Cart merged');
  }),
};
