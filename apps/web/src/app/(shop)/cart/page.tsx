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
import {
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
} from '@/store/api/endpoints/cart';

export default function CartPage() {
  const { data, isLoading, isFetching } = useGetCartQuery();
  const [updateQuantity] = useUpdateCartItemMutation();
  const [removeItem] = useRemoveCartItemMutation();
  const [clearCart, { isLoading: isClearing }] = useClearCartMutation();

  const cart = data?.data;

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      await updateQuantity({ itemId, quantity }).unwrap();
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        'Could not update quantity';
      toast.error(message);
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      await removeItem(itemId).unwrap();
      toast.removedFromCart();
    } catch {
      toast.error('Could not remove item');
    }
  };

  const handleClearCart = async () => {
    if (!confirm('Remove all items from your cart?')) return;
    try {
      await clearCart().unwrap();
      toast.success('Cart cleared');
    } catch {
      toast.error('Could not clear cart');
    }
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
          <div
            className={
              isFetching ? 'opacity-60 transition-opacity' : ''
            }
          >
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
                    disabled={isClearing}
                    className="text-[10px] uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-forest-900 disabled:opacity-50"
                  >
                    {isClearing ? 'Clearing…' : 'Clear cart'}
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
                      isUpdating={isFetching}
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
                <CartSummary cart={cart} />
              </div>
            </div>
          </div>
        )}
      </Container>
    </>
  );
}
