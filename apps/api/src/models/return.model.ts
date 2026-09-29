import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type ReturnStatus =
  | 'pending'          // customer submitted, awaiting admin
  | 'approved'         // admin approved, awaiting shipment
  | 'rejected'         // admin declined
  | 'in_transit'       // customer shipped it back
  | 'received'         // admin received the item
  | 'refunded'         // refund processed
  | 'cancelled';       // customer cancelled request

export type RefundStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type ReturnReason =
  | 'wrong_item'
  | 'damaged'
  | 'not_as_described'
  | 'changed_mind'
  | 'size_fit'
  | 'defective'
  | 'other';

export interface IReturnItem {
  _id: Types.ObjectId;
  orderItemId: Types.ObjectId;    // reference to Order.items[]._id
  productId: Types.ObjectId;
  variantId: Types.ObjectId;
  productName: string;
  sku: string;
  variantLabel: string;
  image: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  restocked: boolean;             // whether stock was restored
}

export interface IReturnTimeline {
  status: ReturnStatus;
  note?: string;
  at: Date;
  by?: string;                    // userId or 'system' or 'admin:<id>'
}

export interface IReturn extends Document {
  _id: Types.ObjectId;
  returnNumber: string;           // RET-YYMMDD-XXXX
  orderId: Types.ObjectId;
  orderNumber: string;
  userId?: Types.ObjectId;
  guestEmail?: string;
  items: IReturnItem[];
  reason: ReturnReason;
  reasonDetail?: string;
  images: string[];
  // Customer info
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  // Return shipping address (where customer ships the item)
  shippingAddress: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  // Financial
  refundAmount: number;
  refundStatus: RefundStatus;
  refundMethod?: 'stripe' | 'razorpay' | 'manual';
  refundTransactionId?: string;
  refundedAt?: Date;
  // Status
  status: ReturnStatus;
  adminNote?: string;
  rejectionReason?: string;
  // Timeline
  timeline: IReturnTimeline[];
  // Dates
  approvedAt?: Date;
  rejectedAt?: Date;
  receivedAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReturnItemSchema = new Schema<IReturnItem>(
  {
    orderItemId: { type: Schema.Types.ObjectId, required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: Schema.Types.ObjectId, required: true },
    productName: { type: String, required: true },
    sku: { type: String, required: true, uppercase: true },
    variantLabel: { type: String, required: true },
    image: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    restocked: { type: Boolean, default: false },
  },
  { _id: true }
);

const ReturnAddressSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: 'India' },
  },
  { _id: false }
);

const ReturnTimelineSchema = new Schema<IReturnTimeline>(
  {
    status: { type: String, required: true },
    note: String,
    at: { type: Date, default: Date.now },
    by: String,
  },
  { _id: false }
);

const ReturnSchema = new Schema<IReturn>(
  {
    returnNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    orderNumber: { type: String, required: true, index: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      sparse: true,
    },
    guestEmail: { type: String, lowercase: true, trim: true, index: true, sparse: true },
    items: {
      type: [ReturnItemSchema],
      required: true,
      validate: {
        validator: (v: IReturnItem[]) => v.length > 0,
        message: 'Return must have at least one item',
      },
    },
    reason: {
      type: String,
      enum: [
        'wrong_item',
        'damaged',
        'not_as_described',
        'changed_mind',
        'size_fit',
        'defective',
        'other',
      ],
      required: true,
    },
    reasonDetail: { type: String, maxlength: 1000 },
    images: {
      type: [String],
      default: [],
      validate: (v: string[]) => v.length <= 5,
    },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerEmail: { type: String, required: true, lowercase: true },
    shippingAddress: { type: ReturnAddressSchema, required: true },
    refundAmount: { type: Number, required: true, min: 0 },
    refundStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    refundMethod: {
      type: String,
      enum: ['stripe', 'razorpay', 'manual'],
    },
    refundTransactionId: String,
    refundedAt: Date,
    status: {
      type: String,
      enum: [
        'pending',
        'approved',
        'rejected',
        'in_transit',
        'received',
        'refunded',
        'cancelled',
      ],
      default: 'pending',
      index: true,
    },
    adminNote: { type: String, maxlength: 1000 },
    rejectionReason: { type: String, maxlength: 500 },
    timeline: { type: [ReturnTimelineSchema], default: [] },
    approvedAt: Date,
    rejectedAt: Date,
    receivedAt: Date,
    cancelledAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

ReturnSchema.index({ userId: 1, createdAt: -1 });
ReturnSchema.index({ status: 1, createdAt: -1 });

export const Return: Model<IReturn> = mongoose.model<IReturn>('Return', ReturnSchema);
