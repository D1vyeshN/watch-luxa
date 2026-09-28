import { Cart, ICart, ICartItem } from '@models/cart.model';
import { Types } from 'mongoose';

export class CartRepository {
  async findByUserId(userId: string): Promise<ICart | null> {
    return Cart.findOne({ userId }).exec();
  }

  async findBySessionId(sessionId: string): Promise<ICart | null> {
    return Cart.findOne({ sessionId }).exec();
  }

  async findByOwner(owner: {
    userId?: string;
    sessionId?: string;
  }): Promise<ICart | null> {
    if (owner.userId) return this.findByUserId(owner.userId);
    if (owner.sessionId) return this.findBySessionId(owner.sessionId);
    return null;
  }

  async createForUser(userId: string): Promise<ICart> {
    return Cart.create({ userId, items: [] });
  }

  async createForSession(sessionId: string): Promise<ICart> {
    return Cart.create({ sessionId, items: [] });
  }

  async addItem(cartId: string, item: ICartItem): Promise<ICart | null> {
    return Cart.findByIdAndUpdate(
      cartId,
      { $push: { items: item } },
      { new: true }
    );
  }

  async updateItemQuantity(
    cartId: string,
    itemId: string,
    quantity: number
  ): Promise<ICart | null> {
    return Cart.findOneAndUpdate(
      { _id: cartId, 'items._id': itemId },
      { $set: { 'items.$.quantity': quantity } },
      { new: true }
    );
  }

  async removeItem(cartId: string, itemId: string): Promise<ICart | null> {
    return Cart.findByIdAndUpdate(
      cartId,
      { $pull: { items: { _id: itemId } } },
      { new: true }
    );
  }

  async clearCart(cartId: string): Promise<ICart | null> {
    return Cart.findByIdAndUpdate(
      cartId,
      { $set: { items: [], couponCode: undefined } },
      { new: true }
    );
  }

  async setCoupon(cartId: string, code?: string): Promise<ICart | null> {
    return Cart.findByIdAndUpdate(
      cartId,
      { $set: { couponCode: code } },
      { new: true }
    );
  }

  async deleteById(cartId: string): Promise<void> {
    await Cart.findByIdAndDelete(cartId);
  }

  /**
   * Merge guest cart into user cart. Called after login.
   * Guest items are appended; duplicates increase quantity.
   */
  async mergeCarts(
    userId: string,
    guestSessionId: string
  ): Promise<ICart | null> {
    const guestCart = await this.findBySessionId(guestSessionId);
    if (!guestCart || guestCart.items.length === 0) {
      // Nothing to merge; just clean up
      if (guestCart) await this.deleteById(guestCart._id.toString());
      return this.findByUserId(userId);
    }

    let userCart = await this.findByUserId(userId);
    if (!userCart) {
      // Promote guest cart to user cart
      return Cart.findOneAndUpdate(
        { sessionId: guestSessionId },
        {
          $set: { userId: new Types.ObjectId(userId) },
          $unset: { sessionId: '' },
        },
        { new: true }
      );
    }

    // Merge items into existing user cart
    for (const guestItem of guestCart.items) {
      const existing = userCart.items.find(
        (i) =>
          i.productId.toString() === guestItem.productId.toString() &&
          i.variantId.toString() === guestItem.variantId.toString()
      );

      if (existing) {
        const newQty = Math.min(existing.quantity + guestItem.quantity, 10);
        await this.updateItemQuantity(
          userCart._id.toString(),
          existing._id.toString(),
          newQty
        );
      } else {
        await this.addItem(userCart._id.toString(), guestItem);
      }
    }

    // Delete guest cart
    await this.deleteById(guestCart._id.toString());

    return this.findByUserId(userId);
  }
}

export const cartRepository = new CartRepository();
