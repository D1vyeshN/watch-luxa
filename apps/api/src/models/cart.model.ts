import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ICartItem {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  variantId: Types.ObjectId;
  sku: string;
  quantity: number;
  // Snapshot for display (prices are fetched live on read)
  productName: string;
  productSlug: string;
  variantLabel: string;   // "Black / Steel / 41mm"
  image: string;
  priceAtAdd: number;
  addedAt: Date;
}

export interface ICart extends Document {
  _id: Types.ObjectId;
  userId?: Types.ObjectId;    // null for guests
  sessionId?: string;         // null for logged-in users
  items: ICartItem[];
  couponCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    variantId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    sku: { type: String, required: true, uppercase: true, trim: true },
    quantity: { type: Number, required: true, min: 1, max: 10 },
    productName: { type: String, required: true },
    productSlug: { type: String, required: true },
    variantLabel: { type: String, required: true },
    image: { type: String, required: true },
    priceAtAdd: { type: Number, required: true, min: 0 },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const CartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      sparse: true,      // allows multiple docs with null userId
      index: true,
    },
    sessionId: {
      type: String,
      unique: true,
      sparse: true,      // allows multiple docs with null sessionId
      index: true,
    },
    items: [CartItemSchema],
    couponCode: { type: String, trim: true, uppercase: true },
  },
  { timestamps: true }
);

// TTL for guest carts — expire after 30 days
CartSchema.index(
  { updatedAt: 1 },
  {
    expireAfterSeconds: 30 * 24 * 60 * 60,
    partialFilterExpression: { userId: { $exists: false } },
  }
);

export const Cart: Model<ICart> = mongoose.model<ICart>('Cart', CartSchema);
