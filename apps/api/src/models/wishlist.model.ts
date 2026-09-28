import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IWishlist extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  productIds: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    productIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        index: true,
      },
    ],
  },
  { timestamps: true }
);

export const Wishlist: Model<IWishlist> = mongoose.model<IWishlist>(
  'Wishlist',
  WishlistSchema
);
