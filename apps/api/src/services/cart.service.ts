import { Types } from 'mongoose';
import { cartRepository } from '@repositories/cart.repository';
import { Product } from '@models/product.model';
import { ICart, ICartItem } from '@models/cart.model';
import {
  BadRequestError,
  NotFoundError,
} from '@utils/AppError';

const MAX_ITEM_QUANTITY = 10;
const MAX_CART_ITEMS = 50;

interface Owner {
  userId?: string;
  sessionId?: string;
}

export class CartService {
  /**
   * Get or create the cart for the current owner.
   */
  private async getOrCreateCart(owner: Owner): Promise<ICart> {
    if (!owner.userId && !owner.sessionId) {
      throw new BadRequestError('Cart session required');
    }

    let cart = await cartRepository.findByOwner(owner);
    if (cart) return cart;

    if (owner.userId) {
      return cartRepository.createForUser(owner.userId);
    }
    return cartRepository.createForSession(owner.sessionId!);
  }

  /**
   * Get cart with live pricing and stock validation.
   */
  async getCart(owner: Owner) {
    const cart = await this.getOrCreateCart(owner);
    return this.hydrateCart(cart);
  }

  /**
   * Add an item. If the variant already exists, increment quantity.
   */
  async addItem(
    owner: Owner,
    input: { productId: string; variantId: string; quantity: number }
  ) {
    const { productId, variantId, quantity } = input;

    if (!Types.ObjectId.isValid(productId) || !Types.ObjectId.isValid(variantId)) {
      throw new BadRequestError('Invalid product or variant ID');
    }

    // Fetch product + variant
    const product = await Product.findOne({
      _id: productId,
      status: 'active',
    }).lean();

    if (!product) throw new NotFoundError('Product not found');

    const variant = product.variants.find(
      (v) => v._id.toString() === variantId && v.isActive
    );

    if (!variant) throw new NotFoundError('Variant not found or unavailable');

    if (variant.stock < quantity) {
      throw new BadRequestError(
        `Only ${variant.stock} units available for this variant`
      );
    }

    const cart = await this.getOrCreateCart(owner);

    if (cart.items.length >= MAX_CART_ITEMS) {
      throw new BadRequestError(
        `Cart is full (max ${MAX_CART_ITEMS} items)`
      );
    }

    // Check if variant already in cart
    const existing = cart.items.find(
      (i) => i.variantId.toString() === variantId
    );

    if (existing) {
      const newQty = Math.min(existing.quantity + quantity, MAX_ITEM_QUANTITY);

      if (newQty > variant.stock) {
        throw new BadRequestError(
          `Cannot add more. Only ${variant.stock} units available.`
        );
      }

      const updated = await cartRepository.updateItemQuantity(
        cart._id.toString(),
        existing._id.toString(),
        newQty
      );
      return this.hydrateCart(updated!);
    }

    // New item — build snapshot
    const item: ICartItem = {
      _id: new Types.ObjectId(),
      productId: new Types.ObjectId(productId),
      variantId: new Types.ObjectId(variantId),
      sku: variant.sku,
      quantity,
      productName: product.name,
      productSlug: product.slug,
      variantLabel: this.buildVariantLabel(variant),
      image: variant.images?.[0] || product.heroImage,
      priceAtAdd: variant.price,
      addedAt: new Date(),
    };

    const updated = await cartRepository.addItem(cart._id.toString(), item);
    return this.hydrateCart(updated!);
  }

  /**
   * Update quantity for an item. Set to 0 to remove.
   */
  async updateItemQuantity(
    owner: Owner,
    itemId: string,
    quantity: number
  ) {
    if (quantity < 0 || quantity > MAX_ITEM_QUANTITY) {
      throw new BadRequestError(
        `Quantity must be between 0 and ${MAX_ITEM_QUANTITY}`
      );
    }

    const cart = await this.getOrCreateCart(owner);
    const item = cart.items.find((i) => i._id.toString() === itemId);

    if (!item) throw new NotFoundError('Item not in cart');

    if (quantity === 0) {
      const updated = await cartRepository.removeItem(
        cart._id.toString(),
        itemId
      );
      return this.hydrateCart(updated!);
    }

    // Stock check
    const product = await Product.findById(item.productId).lean();
    const variant = product?.variants.find(
      (v) => v._id.toString() === item.variantId.toString()
    );

    if (!variant || !variant.isActive) {
      throw new BadRequestError('This variant is no longer available');
    }

    if (variant.stock < quantity) {
      throw new BadRequestError(
        `Only ${variant.stock} units available for this variant`
      );
    }

    const updated = await cartRepository.updateItemQuantity(
      cart._id.toString(),
      itemId,
      quantity
    );
    return this.hydrateCart(updated!);
  }

  /**
   * Remove an item from the cart.
   */
  async removeItem(owner: Owner, itemId: string) {
    const cart = await this.getOrCreateCart(owner);
    const item = cart.items.find((i) => i._id.toString() === itemId);
    if (!item) throw new NotFoundError('Item not in cart');

    const updated = await cartRepository.removeItem(
      cart._id.toString(),
      itemId
    );
    return this.hydrateCart(updated!);
  }

  /**
   * Clear all items.
   */
  async clearCart(owner: Owner) {
    const cart = await this.getOrCreateCart(owner);
    const updated = await cartRepository.clearCart(cart._id.toString());
    return this.hydrateCart(updated!);
  }

  /**
   * Merge guest cart into user cart on login.
   */
  async mergeCart(userId: string, sessionId: string) {
    const merged = await cartRepository.mergeCarts(userId, sessionId);
    if (!merged) return null;
    return this.hydrateCart(merged);
  }

  /**
   * Hydrate cart with live prices, stock status, and computed totals.
   */
  private async hydrateCart(cart: ICart) {
    if (!cart.items.length) {
      return {
        id: cart._id,
        items: [],
        itemCount: 0,
        subtotal: 0,
        total: 0,
        currency: 'INR',
      };
    }

    // Fetch all products in one query
    const productIds = cart.items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const items = cart.items.map((item) => {
      const product = productMap.get(item.productId.toString());
      const variant = product?.variants.find(
        (v) => v._id.toString() === item.variantId.toString()
      );

      const isAvailable = Boolean(
        variant && variant.isActive && product?.status === 'active'
      );
      const stock = variant?.stock ?? 0;
      const currentPrice = variant?.price ?? item.priceAtAdd;
      const lineTotal = currentPrice * item.quantity;

      const issues: string[] = [];
      if (!isAvailable) issues.push('Product no longer available');
      if (isAvailable && stock < item.quantity) {
        issues.push(`Only ${stock} units in stock`);
      }

      return {
        id: item._id,
        productId: item.productId,
        variantId: item.variantId,
        sku: item.sku,
        productName: item.productName,
        productSlug: item.productSlug,
        variantLabel: item.variantLabel,
        image: item.image,
        quantity: item.quantity,
        price: currentPrice,
        priceAtAdd: item.priceAtAdd,
        priceChanged: currentPrice !== item.priceAtAdd,
        lineTotal,
        stock,
        isAvailable,
        issues: issues.length ? issues : undefined,
      };
    });

    const subtotal = items.reduce(
      (sum, item) => sum + (item.isAvailable ? item.lineTotal : 0),
      0
    );

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: cart._id,
      items,
      itemCount,
      subtotal,
      total: subtotal, // discount applied at checkout
      couponCode: cart.couponCode,
      currency: 'INR',
      hasIssues: items.some((i) => i.issues && i.issues.length > 0),
    };
  }

  private buildVariantLabel(variant: any): string {
    const parts = [
      variant.dialColor,
      variant.caseMaterial,
      variant.caseSize ? `${variant.caseSize}mm` : null,
      variant.strapType,
    ].filter(Boolean);
    return parts.join(' / ');
  }
}

export const cartService = new CartService();
