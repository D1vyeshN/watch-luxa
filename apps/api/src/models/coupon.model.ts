import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type CouponType = 'percentage' | 'fixed';

export interface ICoupon extends Document {
  _id: Types.ObjectId;
  code: string;                     // uppercase, unique
  description?: string;
  type: CouponType;
  value: number;                    // percentage (0-100) or paise for fixed
  maxDiscount?: number;             // cap for percentage coupons (in paise)
  minOrder?: number;                // minimum subtotal in paise
  maxUses?: number;                 // total uses allowed
  maxUsesPerUser?: number;          // per-user uses allowed
  usedCount: number;                // total times used
  usedBy: Types.ObjectId[];         // user IDs who used it (and count via aggregation)
  expiresAt?: Date;
  startsAt?: Date;
  isActive: boolean;
  autoApply: boolean;               // auto-apply at checkout
  createdBy?: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      index: true,
    },
    description: { type: String, maxlength: 200, trim: true },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function (this: ICoupon, v: number) {
          if (this.type === 'percentage') return v > 0 && v <= 100;
          return v > 0;
        },
        message: 'Percentage must be 1-100; fixed amount must be > 0',
      },
    },
    maxDiscount: { type: Number, min: 0 },
    minOrder: { type: Number, min: 0, default: 0 },
    maxUses: { type: Number, min: 1 },
    maxUsesPerUser: { type: Number, min: 1, default: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    usedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    expiresAt: Date,
    startsAt: Date,
    isActive: { type: Boolean, default: true, index: true },
    autoApply: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.Mixed }, // Can be ObjectId or string (for superadmin)
  },
  { timestamps: true }
);

// Active coupons index for storefront auto-apply
CouponSchema.index({ isActive: 1, autoApply: 1, expiresAt: 1 });

export const Coupon: Model<ICoupon> = mongoose.model<ICoupon>('Coupon', CouponSchema);
