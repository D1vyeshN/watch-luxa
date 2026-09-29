import { Types } from 'mongoose';
import { couponRepository, FindManyOptions } from '@repositories/coupon.repository';
import { ICoupon, CouponType } from '@models/coupon.model';
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
} from '@utils/AppError';

export interface CouponValidationResult {
  valid: boolean;
  code: string;
  type: CouponType;
  value: number;
  maxDiscount?: number;
  discount: number;         // computed discount in paise
  message: string;
}

export interface CartLine {
  price: number;
  quantity: number;
}

export class CouponService {
  // ─────────────────────────────────────────────────────────
  // ADMIN
  // ─────────────────────────────────────────────────────────

  async list(
    filter: any,
    options: FindManyOptions
  ) {
    return couponRepository.findMany(filter, options);
  }

  async getById(id: string): Promise<ICoupon> {
    const coupon = await couponRepository.findById(id);
    if (!coupon) throw new NotFoundError('Coupon not found');
    return coupon;
  }

  async create(
    data: Partial<ICoupon>,
    createdBy: string | Types.ObjectId
  ): Promise<ICoupon> {
    const code = data.code?.toUpperCase().trim();
    if (!code) throw new BadRequestError('Coupon code is required');

    // Validate percentage range
    if (data.type === 'percentage') {
      if (!data.value || data.value < 1 || data.value > 100) {
        throw new BadRequestError('Percentage must be between 1 and 100');
      }
      if (!data.maxDiscount) {
        throw new BadRequestError(
          'maxDiscount is required for percentage coupons'
        );
      }
    } else if (data.type === 'fixed') {
      if (!data.value || data.value <= 0) {
        throw new BadRequestError('Fixed amount must be greater than 0');
      }
    }

    // Validate date range
    if (data.expiresAt && data.startsAt) {
      if (new Date(data.expiresAt) <= new Date(data.startsAt)) {
        throw new BadRequestError('expiresAt must be after startsAt');
      }
    }

    const existing = await couponRepository.findByCode(code);
    if (existing) {
      throw new ConflictError('A coupon with this code already exists');
    }

    // Handle super admin case - don't convert to ObjectId if it's already a string like 'superadmin'
    const createdByValue = createdBy === 'superadmin' ? createdBy : new Types.ObjectId(createdBy);

    return couponRepository.create({
      ...data,
      code,
      createdBy: createdByValue,
    });
  }

  async update(
    id: string,
    data: Partial<ICoupon>
  ): Promise<ICoupon> {
    const coupon = await couponRepository.findById(id);
    if (!coupon) throw new NotFoundError('Coupon not found');

    // If changing code, check for duplicates
    if (data.code && data.code.toUpperCase() !== coupon.code) {
      const existing = await couponRepository.findByCode(data.code);
      if (existing && existing._id.toString() !== id) {
        throw new ConflictError('A coupon with this code already exists');
      }
      data.code = data.code.toUpperCase().trim();
    }

    // Validate value if type is changing
    const type = data.type || coupon.type;
    const value = data.value ?? coupon.value;

    if (type === 'percentage') {
      if (value < 1 || value > 100) {
        throw new BadRequestError('Percentage must be between 1 and 100');
      }
    } else if (value <= 0) {
      throw new BadRequestError('Fixed amount must be greater than 0');
    }

    const updated = await couponRepository.update(id, data);
    if (!updated) throw new NotFoundError('Coupon not found');
    return updated;
  }

  async deactivate(id: string): Promise<ICoupon> {
    const coupon = await couponRepository.findById(id);
    if (!coupon) throw new NotFoundError('Coupon not found');

    const updated = await couponRepository.update(id, { isActive: false });
    if (!updated) throw new NotFoundError('Coupon not found');
    return updated;
  }

  async reactivate(id: string): Promise<ICoupon> {
    const coupon = await couponRepository.findById(id);
    if (!coupon) throw new NotFoundError('Coupon not found');

    const updated = await couponRepository.update(id, { isActive: true });
    if (!updated) throw new NotFoundError('Coupon not found');
    return updated;
  }

  async delete(id: string): Promise<void> {
    const coupon = await couponRepository.findById(id);
    if (!coupon) throw new NotFoundError('Coupon not found');
    await couponRepository.delete(id);
  }

  // ─────────────────────────────────────────────────────────
  // PUBLIC / CHECKOUT
  // ─────────────────────────────────────────────────────────

  /**
   * Validate a coupon code against a cart. Returns the discount.
   */
  async validateForCart(
    code: string,
    cartLines: CartLine[],
    userId?: string
  ): Promise<CouponValidationResult> {
    const coupon = await couponRepository.findByCode(code);

    if (!coupon) {
      return {
        valid: false,
        code,
        type: 'percentage',
        value: 0,
        discount: 0,
        message: 'Invalid coupon code',
      };
    }

    // Active?
    if (!coupon.isActive) {
      return this.invalid(coupon, 'This coupon is no longer active');
    }

    // Date range
    const now = new Date();
    if (coupon.startsAt && new Date(coupon.startsAt) > now) {
      return this.invalid(coupon, 'This coupon is not yet valid');
    }
    if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
      return this.invalid(coupon, 'This coupon has expired');
    }

    // Total uses
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return this.invalid(coupon, 'This coupon has reached its usage limit');
    }

    // Per-user uses
    if (coupon.maxUsesPerUser && userId) {
      // Note: usedBy is a unique set; per-user count is either 0 or 1
      const userUsed = coupon.usedBy.some(
        (id) => id.toString() === userId
      );
      if (userUsed && coupon.maxUsesPerUser <= 1) {
        return this.invalid(coupon, 'You have already used this coupon');
      }
    }

    // Compute subtotal
    const subtotal = cartLines.reduce(
      (sum, line) => sum + line.price * line.quantity,
      0
    );

    // Minimum order
    if (coupon.minOrder && subtotal < coupon.minOrder) {
      const formatted = (coupon.minOrder / 100).toLocaleString('en-IN');
      return this.invalid(
        coupon,
        `Minimum order of ₹${formatted} required`
      );
    }

    // Compute discount
    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = Math.round((subtotal * coupon.value) / 100);
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.value;
    }

    discount = Math.min(discount, subtotal);

    return {
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      maxDiscount: coupon.maxDiscount,
      discount,
      message: `Coupon applied — ₹${(discount / 100).toLocaleString('en-IN')} off`,
    };
  }

  /**
   * Get auto-apply coupons that are valid for the current cart.
   * Returns the best one (highest discount).
   */
  async getBestAutoApply(
    cartLines: CartLine[],
    userId?: string
  ): Promise<CouponValidationResult | null> {
    const coupons = await couponRepository.findAutoApply();
    if (!coupons.length) return null;

    let best: CouponValidationResult | null = null;

    for (const coupon of coupons) {
      const result = await this.validateForCart(
        coupon.code,
        cartLines,
        userId
      );
      if (result.valid && (!best || result.discount > best.discount)) {
        best = result;
      }
    }

    return best;
  }

  /**
   * List currently valid public coupons for a "deals" page.
   * Only returns safe fields — no internal metrics.
   */
  async listPublicActive() {
    const now = new Date();
    const coupons = await couponRepository.findMany(
      {
        isActive: true,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gte: now } },
        ],
      },
      { skip: 0, limit: 50, sort: { createdAt: -1 } }
    );

    return coupons.data.map((c) => ({
      code: c.code,
      description: c.description,
      type: c.type,
      value: c.value,
      maxDiscount: c.maxDiscount,
      minOrder: c.minOrder,
      expiresAt: c.expiresAt,
    }));
  }

  private invalid(
    coupon: ICoupon,
    message: string
  ): CouponValidationResult {
    return {
      valid: false,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount: 0,
      message,
    };
  }
}

export const couponService = new CouponService();
