import { Request, Response } from 'express';
import { couponService, CartLine } from '@services/coupon.service';
import { cartRepository } from '@repositories/cart.repository';
import { Product } from '@models/product.model';
import { sendSuccess } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';
import { BadRequestError } from '@utils/AppError';

export const couponController: any = {
  /**
   * POST /api/v1/coupons/apply
   * Validate a coupon against the current cart.
   * Returns the discount amount without applying it permanently.
   */
  apply: asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.body;

    const owner = {
      userId: req.user?.userId,
      sessionId: req.sessionId,
    };

    // Load cart and build lines with live prices
    const cart = await cartRepository.findByOwner(owner);
    if (!cart || cart.items.length === 0) {
      throw new BadRequestError('Cart is empty');
    }

    const productIds = cart.items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const lines: CartLine[] = [];
    for (const item of cart.items) {
      const product = productMap.get(item.productId.toString());
      const variant = product?.variants.find(
        (v) => v._id.toString() === item.variantId.toString()
      );
      if (!variant || !variant.isActive) {
        throw new BadRequestError(
          `"${item.productName}" is no longer available`
        );
      }
      lines.push({ price: variant.price, quantity: item.quantity });
    }

    const result = await couponService.validateForCart(
      code,
      lines,
      req.user?.userId
    );

    return sendSuccess(res, result, result.message);
  }),

  /**
   * GET /api/v1/coupons/auto-apply
   * Returns the best auto-apply coupon for the current cart.
   */
  autoApply: asyncHandler(async (req: Request, res: Response) => {
    const owner = {
      userId: req.user?.userId,
      sessionId: req.sessionId,
    };

    const cart = await cartRepository.findByOwner(owner);
    if (!cart || cart.items.length === 0) {
      return sendSuccess(res, null, 'No cart');
    }

    const productIds = cart.items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const lines: CartLine[] = [];
    for (const item of cart.items) {
      const product = productMap.get(item.productId.toString());
      const variant = product?.variants.find(
        (v) => v._id.toString() === item.variantId.toString()
      );
      if (variant?.isActive) {
        lines.push({ price: variant.price, quantity: item.quantity });
      }
    }

    const best = await couponService.getBestAutoApply(lines, req.user?.userId);
    return sendSuccess(res, best, best ? best.message : 'No auto-apply coupon');
  }),

  /**
   * GET /api/v1/coupons/active
   * Public list of active coupons for a "deals" page.
   */
  listActive: asyncHandler(async (_req: Request, res: Response) => {
    const coupons = await couponService.listPublicActive();
    return sendSuccess(res, coupons, 'Active coupons');
  }),
};
