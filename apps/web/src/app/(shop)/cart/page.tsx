'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Container } from '@/components/shared/container';
import {
  CartItemRow,
  CartSummary,
  CartEmptyState,
  CartLoadingSkeleton,
} from '@/components/cart';
import { toast } from '@/hooks/useToast';
import { ROUTES } from '@/constants/routes';
import { useCart } from '@/hooks/useCart';

export default function CartPage() {
  const {
    items,
    isLoading,
    updateCartItem,
    removeCartItem,
    clearCart,
    getCartTotal,
    getCartCount,
    isGuest,
  } = useCart();

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      await updateCartItem(itemId, quantity);
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        'Could not update quantity';
      toast.error(message);
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      await removeCartItem(itemId);
      toast.removedFromCart();
    } catch {
      toast.error('Could not remove item');
    }
  };

  const handleClearCart = async () => {
    if (!confirm('Remove all items from your cart?')) return;
    try {
      await clearCart();
      toast.success('Cart cleared');
    } catch {
      toast.error('Could not clear cart');
    }
  };

  // Calculate cart totals for guest users
  const subtotal = getCartTotal();
  const itemCount = getCartCount();
  const taxRate = 0.18;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  const shippingFee = subtotal >= 500000 ? 0 : 50000; // Free shipping above ₹5,000

  const cart = {
    id: 'guest-cart',
    items,
    subtotal,
    tax,
    taxRate,
    shippingFee,
    total,
    itemCount,
    hasIssues: false, // Guest cart doesn't have stock validation
    currency: 'INR',
  };

  return (
    <>
      {/* Page header */}
      <div className="border-b border-forest-900/10 bg-cream-100">
        <Container className="py-10 md:py-14">
          <Link
            href={ROUTES.shop}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-forest-900"
          >
            <ChevronLeft className="h-3 w-3" />
            Continue shopping
          </Link>

          <h1 className="heading-luxe mt-6 text-4xl md:text-5xl">
            Your Cart
            {cart && cart.itemCount > 0 && (
              <span className="ml-3 text-2xl text-ink-muted">
                ({cart.itemCount})
              </span>
            )}
          </h1>
        </Container>
      </div>

      <Container className="py-10 md:py-14">
        {/* Loading */}
        {isLoading && <CartLoadingSkeleton />}

        {/* Empty */}
        {!isLoading && (!cart || cart.items.length === 0) && (
          <CartEmptyState />
        )}

        {/* Has items */}
        {!isLoading && cart && cart.items.length > 0 && (
          <div>
            {/* Guest notice */}
            {isGuest && (
              <div className="mb-6 border border-forest-900/10 bg-cream-100 p-4">
                <p className="text-sm text-forest-900">
                  <Link
                    href={ROUTES.login}
                    className="font-medium underline underline-offset-4"
                  >
                    Sign in
                  </Link>{' '}
                  to sync your cart across devices and access your order history.
                </p>
              </div>
            )}

            <div className="grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-14">
              {/* Left: Items */}
              <div>
                {/* Toolbar */}
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.14em] text-forest-900">
                    {cart.items.length}{' '}
                    {cart.items.length === 1 ? 'Item' : 'Items'}
                  </p>

                  <button
                    onClick={handleClearCart}
                    className="text-[10px] uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-forest-900"
                  >
                    Clear cart
                  </button>
                </div>

                {/* Items list */}
                <div className="border-t border-forest-900/10">
                  {cart.items.map((item) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemove={handleRemove}
                      isUpdating={false}
                    />
                  ))}
                </div>

                {/* Promo note */}
                <div className="mt-8 border border-cream-600/30 bg-cream-200/40 p-4">
                  <p className="text-xs text-forest-900">
                    ✦ Complimentary gift wrapping on orders above ₹1,00,000
                  </p>
                </div>
              </div>

              {/* Right: Summary */}
              <div className="lg:sticky lg:top-24 lg:self-start">
                <CartSummary cart={cart} isGuest={isGuest} />
              </div>
            </div>
          </div>
        )}
      </Container>
    </>
  );
}
