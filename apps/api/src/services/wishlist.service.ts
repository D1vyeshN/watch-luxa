import { wishlistRepository } from '@repositories/wishlist.repository';
import { Product } from '@models/product.model';
import { Types } from 'mongoose';
import { BadRequestError, NotFoundError } from '@utils/AppError';
import { toStorefrontProduct } from '@utils/storefrontFilters';

export class WishlistService {
  /**
   * Get wishlist with populated products.
   */
  async getWishlist(userId: string) {
    const wishlist = await wishlistRepository.findOrCreate(userId);

    if (wishlist.productIds.length === 0) {
      return { productIds: [], products: [], count: 0 };
    }

    const products = await Product.find({
      _id: { $in: wishlist.productIds },
      status: 'active',
    })
      .populate('brandId', 'name slug logo')
      .lean();

    return {
      productIds: wishlist.productIds,
      products: products.map((p) => toStorefrontProduct(p, false)),
      count: products.length,
    };
  }

  /**
   * Add a product to wishlist.
   */
  async addProduct(userId: string, productId: string) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestError('Invalid product ID');
    }

    const product = await Product.findOne({
      _id: productId,
      status: 'active',
    }).lean();
    if (!product) throw new NotFoundError('Product not found');

    const wishlist = await wishlistRepository.addProduct(userId, productId);
    return { count: wishlist?.productIds.length || 0, added: true };
  }

  /**
   * Remove a product from wishlist.
   */
  async removeProduct(userId: string, productId: string) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestError('Invalid product ID');
    }

    const wishlist = await wishlistRepository.removeProduct(userId, productId);
    return { count: wishlist?.productIds.length || 0, removed: true };
  }

  /**
   * Toggle a product (add if not present, remove if present).
   * Useful for single-button UI.
   */
  async toggleProduct(userId: string, productId: string) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestError('Invalid product ID');
    }

    const wishlist = await wishlistRepository.findOrCreate(userId);
    const exists = wishlist.productIds.some(
      (id) => id.toString() === productId
    );

    if (exists) {
      const updated = await wishlistRepository.removeProduct(userId, productId);
      return {
        added: false,
        inWishlist: false,
        count: updated?.productIds.length || 0,
      };
    }

    const product = await Product.findOne({
      _id: productId,
      status: 'active',
    }).lean();
    if (!product) throw new NotFoundError('Product not found');

    const updated = await wishlistRepository.addProduct(userId, productId);
    return {
      added: true,
      inWishlist: true,
      count: updated?.productIds.length || 0,
    };
  }

  /**
   * Check if a product is in wishlist (fast check).
   */
  async checkProduct(userId: string, productId: string) {
    const wishlist = await wishlistRepository.findByUserId(userId);
    if (!wishlist) return { inWishlist: false };
    return {
      inWishlist: wishlist.productIds.some(
        (id) => id.toString() === productId
      ),
    };
  }

  /**
   * Clear wishlist.
   */
  async clear(userId: string) {
    await wishlistRepository.clear(userId);
    return { count: 0 };
  }
}

export const wishlistService = new WishlistService();
