import { Wishlist, IWishlist } from '@models/wishlist.model';
import { Types } from 'mongoose';

export class WishlistRepository {
  async findByUserId(userId: string): Promise<IWishlist | null> {
    return Wishlist.findOne({ userId }).exec();
  }

  async findOrCreate(userId: string): Promise<IWishlist> {
    const existing = await this.findByUserId(userId);
    if (existing) return existing;
    return Wishlist.create({ userId, productIds: [] });
  }

  async addProduct(userId: string, productId: string): Promise<IWishlist | null> {
    return Wishlist.findOneAndUpdate(
      { userId },
      { $addToSet: { productIds: new Types.ObjectId(productId) } },
      { new: true, upsert: true }
    );
  }

  async removeProduct(userId: string, productId: string): Promise<IWishlist | null> {
    return Wishlist.findOneAndUpdate(
      { userId },
      { $pull: { productIds: new Types.ObjectId(productId) } },
      { new: true }
    );
  }

  async clear(userId: string): Promise<IWishlist | null> {
    return Wishlist.findOneAndUpdate(
      { userId },
      { $set: { productIds: [] } },
      { new: true }
    );
  }
}

export const wishlistRepository = new WishlistRepository();
