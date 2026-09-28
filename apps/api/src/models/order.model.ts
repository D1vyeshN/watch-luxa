import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentMethod = 'stripe' | 'razorpay' | 'cod';

export interface IOrderItem {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  variantId: Types.ObjectId;
  // Snapshot — never changes even if product is edited later
  productName: string;
  productSlug: string;
  sku: string;
  variantLabel: string;
  image: string;
  quantity: number;
  unitPrice: number;      // price at time of purchase (in paise)
  totalPrice: number;     // unitPrice × quantity
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface IOrderTimeline {
  status: OrderStatus;
  note?: string;
  at: Date;
  by?: string;    // userId or 'system'
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  orderNumber: string;
  userId?: Types.ObjectId;        // null for guest orders
  guestEmail?: string;             // for guest orders
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  billingAddress?: IShippingAddress;
  // Financials
  subtotal: number;
  discount: number;
  tax: number;
  taxRate: number;
  shippingFee: number;
  total: number;
  currency: string;
  couponCode?: string;
  // Payment
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string;
  paidAt?: Date;
  // Fulfillment
  orderStatus: OrderStatus;
  trackingNumber?: string;
  carrier?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  refundedAt?: Date;
  // Notes
  customerNote?: string;
  internalNote?: string;
  // Timeline
  timeline: IOrderTimeline[];
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────────────────────
// SUB-SCHEMAS
// ─────────────────────────────────────────────────────────────

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: Schema.Types.ObjectId, required: true },
    productName: { type: String, required: true },
    productSlug: { type: String, required: true },
    sku: { type: String, required: true, uppercase: true },
    variantLabel: { type: String, required: true },
    image: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

const AddressSchema = new Schema<IShippingAddress>(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: 'India' },
  },
  { _id: false }
);

const TimelineSchema = new Schema<IOrderTimeline>(
  {
    status: {
      type: String,
      enum: [
        'pending', 'paid', 'processing', 'shipped',
        'delivered', 'cancelled', 'refunded',
      ],
      required: true,
    },
    note: String,
    at: { type: Date, default: Date.now },
    by: String,
  },
  { _id: false }
);

// ─────────────────────────────────────────────────────────────
// MAIN SCHEMA
// ─────────────────────────────────────────────────────────────

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      sparse: true,
    },
    guestEmail: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
      sparse: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (v: IOrderItem[]) => v.length > 0,
        message: 'Order must have at least one item',
      },
    },
    shippingAddress: { type: AddressSchema, required: true },
    billingAddress: AddressSchema,
    // Financials
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    tax: { type: Number, required: true, min: 0 },
    taxRate: { type: Number, required: true, min: 0, max: 1 },
    shippingFee: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    couponCode: { type: String, uppercase: true, trim: true },
    // Payment
    paymentMethod: {
      type: String,
      enum: ['stripe', 'razorpay', 'cod'],
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    paymentIntentId: String,
    paidAt: Date,
    // Fulfillment
    orderStatus: {
      type: String,
      enum: [
        'pending', 'paid', 'processing', 'shipped',
        'delivered', 'cancelled', 'refunded',
      ],
      default: 'pending',
      index: true,
    },
    trackingNumber: String,
    carrier: String,
    shippedAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    refundedAt: Date,
    // Notes
    customerNote: { type: String, maxlength: 500 },
    internalNote: { type: String, maxlength: 1000 },
    // Timeline
    timeline: { type: [TimelineSchema], default: [] },
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

// Indexes for common queries
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ orderStatus: 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1, createdAt: -1 });
OrderSchema.index({ createdAt: -1 });

export const Order: Model<IOrder> = mongoose.model<IOrder>('Order', OrderSchema);
