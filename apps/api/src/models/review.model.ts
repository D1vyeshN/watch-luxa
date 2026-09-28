import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface IReviewReply {
  text: string;
  by: Types.ObjectId;    // admin userId
  at: Date;
}

export interface IReview extends Document {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  userId: Types.ObjectId;
  orderId?: Types.ObjectId;      // proof of purchase
  rating: number;                 // 1–5
  title?: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  status: ReviewStatus;
  rejectionReason?: string;
  helpfulCount: number;
  helpfulUserIds: Types.ObjectId[];
  reportCount: number;
  reply?: IReviewReply;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewReplySchema = new Schema<IReviewReply>(
  {
    text: { type: String, required: true, maxlength: 1000 },
    by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ReviewSchema = new Schema<IReview>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      index: true,
    },
    title: { type: String, maxlength: 100, trim: true },
    comment: { type: String, required: true, minlength: 10, maxlength: 2000 },
    images: { type: [String], default: [], validate: (v: string[]) => v.length <= 3 },
    isVerifiedPurchase: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    rejectionReason: { type: String, maxlength: 500 },
    helpfulCount: { type: Number, default: 0, min: 0 },
    helpfulUserIds: { type: [Schema.Types.ObjectId], default: [], select: false },
    reportCount: { type: Number, default: 0, min: 0 },
    reply: ReviewReplySchema,
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete (ret as any).__v;
        delete (ret as any).helpfulUserIds;
        return ret;
      },
    },
  }
);

// One review per user per product
ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

// Admin list — most recent pending first
ReviewSchema.index({ status: 1, createdAt: -1 });

// Product page — approved reviews only
ReviewSchema.index({ productId: 1, status: 1, createdAt: -1 });

export const Review: Model<IReview> = mongoose.model<IReview>('Review', ReviewSchema);
