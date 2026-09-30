'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { CartItem } from './cart-item';
import { formatPrice } from '@/lib/format/price';
import { ROUTES } from '@/constants/routes';
import { CONFIG } from '@/constants/config';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeCartDrawer } from '@/store/slices/uiSlice';
import { useCart } from '@/hooks/useCart';

export function CartDrawer() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((s) => s.ui.isCartDrawerOpen);

  const { items, isLoading, updateCartItem, removeCartItem, getCartTotal, getCartCount, isGuest } = useCart();
  const close = () => dispatch(closeCartDrawer());

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    await updateCartItem(itemId, quantity);
  };

  const handleRemove = async (itemId: string) => {
    await removeCartItem(itemId);
  };

  const goToCheckout = () => {
    close();
    router.push(isGuest ? ROUTES.login : ROUTES.checkout);
  };

  // Calculate cart totals for guest users
  const subtotal = getCartTotal();
  const itemCount = getCartCount();
  const taxRate = CONFIG.taxRate;
  const tax = subtotal * taxRate;
  const shippingFee = subtotal >= CONFIG.freeShippingThreshold ? 0 : CONFIG.flatShippingFee;
  const total = subtotal + tax + shippingFee;
  const hasIssues = false; // Guest cart doesn't have stock validation

  const cart = {
    items,
    subtotal,
    tax,
    taxRate,
    shippingFee,
    total,
    itemCount,
    hasIssues,
  };

  return (
    <Sheet open={isOpen} onOpenChange={close}>
      <SheetContent className="flex w-full flex-col gap-0 border-l-0 bg-cream-100 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-forest-900/10 px-6 py-5">
          <SheetTitle className="flex items-center gap-2 font-serif text-xl tracking-wide text-forest-900">
            <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
            Your Cart {cart.itemCount > 0 && `(${cart.itemCount})`}
          </SheetTitle>
        </SheetHeader>

        {/* Loading state */}
        {isLoading && (
          <div className="flex-1 space-y-4 px-6 py-5">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && cart.items.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10 text-center">
            <ShoppingBag className="h-12 w-12 text-ink-light" strokeWidth={1} />
            <div>
              <p className="heading-luxe text-xl">Your cart is empty</p>
              <p className="mt-2 text-sm text-ink-soft">
                Explore our collection of exceptional timepieces.
              </p>
            </div>
            <Button
              asChild
              onClick={close}
              className="rounded-sm bg-forest-900 px-6 py-3 text-xs uppercase tracking-[0.18em] text-cream-100 hover:bg-forest-800"
            >
              <Link href={ROUTES.shop}>Shop watches</Link>
            </Button>
          </div>
        )}

        {/* Items + summary */}
        {!isLoading && cart.items.length > 0 && (
          <>
            <div className="flex-1 overflow-y-auto px-6">
              {cart.items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemove}
                  onNavigate={close}
                />
              ))}
            </div>

            {/* Footer summary */}
            <div className="border-t border-forest-900/10 bg-cream-50 px-6 py-5">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-ink-soft">
                  <span>Subtotal ({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'})</span>
                  <span className="font-medium text-forest-900">
                    {formatPrice(cart.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-ink-soft">
                  <span>Shipping</span>
                  <span className="font-medium text-forest-900">
                    {cart.subtotal >= CONFIG.freeShippingThreshold
                      ? 'Free'
                      : formatPrice(CONFIG.flatShippingFee)}
                  </span>
                </div>

                <div className="flex justify-between text-ink-soft">
                  <span>Estimated GST ({(CONFIG.taxRate * 100).toFixed(0)}%)</span>
                  <span className="font-medium text-forest-900">
                    {formatPrice(Math.round(cart.subtotal * CONFIG.taxRate))}
                  </span>
                </div>
              </div>

              <Separator className="my-4 bg-forest-900/10" />

              <div className="flex items-baseline justify-between">
                <span className="text-xs uppercase tracking-[0.18em] text-forest-900">
                  Total
                </span>
                <span className="font-serif text-xl font-medium text-forest-900">
                  {formatPrice(
                    cart.subtotal +
                      (cart.subtotal >= CONFIG.freeShippingThreshold
                        ? 0
                        : CONFIG.flatShippingFee) +
                      Math.round(cart.subtotal * CONFIG.taxRate)
                  )}
                </span>
              </div>

              <Button
                onClick={goToCheckout}
                disabled={cart.hasIssues}
                className="mt-4 h-12 w-full rounded-sm bg-forest-900 text-xs uppercase tracking-[0.18em] text-cream-100 hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isGuest ? 'Sign In to Checkout' : 'Proceed to Checkout'}
              </Button>

              <Link
                href={ROUTES.cart}
                onClick={close}
                className="mt-3 block w-full text-center text-xs uppercase tracking-[0.18em] text-ink-muted transition-colors hover:text-forest-900"
              >
                View Cart
              </Link>

              <button
                onClick={close}
                className="mt-2 w-full text-center text-xs uppercase tracking-[0.18em] text-ink-muted transition-colors hover:text-forest-900"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
