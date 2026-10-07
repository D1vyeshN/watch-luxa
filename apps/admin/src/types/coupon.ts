// Mirrors apps/api/src/models/coupon.model.ts. Money fields are in paise;
// `value` is a percentage (1–100) or paise depending on `type`.

export type CouponType = 'percentage' | 'fixed';

export interface Coupon {
  _id: string;
  code: string;
  description?: string;
  type: CouponType;
  value: number;
  maxDiscount?: number | null;
  minOrder?: number;
  maxUses?: number | null;
  maxUsesPerUser?: number;
  usedCount: number;
  startsAt?: string | null;
  expiresAt?: string | null;
  isActive: boolean;
  autoApply: boolean;
  createdAt: string;
  updatedAt: string;
}
