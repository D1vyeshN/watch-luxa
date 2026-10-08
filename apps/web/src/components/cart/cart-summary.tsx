'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/format/price';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { estimateTotals, formatTaxRate } from '@/lib/checkout/estimate';
import { ROUTES } from '@/constants/routes';
import type { Cart } from '@/types/cart';
import { useAuth } from '@/hooks/useAuth';

interface CartSummaryProps {
  cart: Cart;
  showCheckoutButton?: boolean;
  showCoupon?: boolean;
  className?: string;
  isGuest?: boolean;
}

export function CartSummary({
  cart,
  showCheckoutButton = true,
  showCoupon = true,
  className,
  isGuest = false,
}: CartSummaryProps) {
  const { isAuthenticated } = useAuth();

  // Use pre-calculated values if the cart has them, otherwise estimate with
  // the same rules and live rates checkout uses
  const rates = useStoreSettings();
  const subtotal = cart.subtotal;
  const estimate = estimateTotals(subtotal, rates);
  const freeShipping = estimate.freeShipping;
  const shippingFee = cart.shippingFee ?? estimate.shippingFee;
  const estimatedTax = cart.tax ?? estimate.tax;
  const total = cart.total ?? subtotal + shippingFee + estimatedTax;
  const taxRate = cart.taxRate ?? rates.taxRate;

  const freeShippingRemaining = estimate.freeShippingRemaining;

  return (
    <div
      className={cn(
        'border border-forest-900/10 bg-cream-100 p-6 md:p-8',
        className
      )}
    >
      <h2 className="heading-luxe text-xl">Order Summary</h2>

      {/* Free shipping nudge */}
      {!freeShipping && freeShippingRemaining > 0 && (
        <div className="mt-5 border border-cream-600/30 bg-cream-200/50 p-3">
          <p className="text-xs text-forest-900">
            Add {formatPrice(freeShippingRemaining)} more for free shipping.
          </p>
        </div>
      )}

      {freeShipping && (
        <div className="mt-5 border border-forest-900/10 bg-cream-200/50 p-3">
          <p className="text-xs text-forest-900">
            ✓ You qualify for free insured shipping.
          </p>
        </div>
      )}

      {/* Line items */}
      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-soft">
            Subtotal ({cart.itemCount}{' '}
            {cart.itemCount === 1 ? 'item' : 'items'})
          </dt>
          <dd className="font-medium text-forest-900">
            {formatPrice(subtotal)}
          </dd>
        </div>

        <div className="flex justify-between">
          <dt className="text-ink-soft">Shipping</dt>
          <dd className="font-medium text-forest-900">
            {freeShipping ? 'Free' : formatPrice(shippingFee)}
          </dd>
        </div>

        <div className="flex justify-between">
          <dt className="text-ink-soft">
            Estimated GST ({formatTaxRate(taxRate)})
          </dt>
          <dd className="font-medium text-forest-900">
            {formatPrice(estimatedTax)}
          </dd>
        </div>
      </dl>

      <Separator className="my-6 bg-forest-900/10" />

      <div className="flex items-baseline justify-between">
        <span className="text-xs uppercase tracking-[0.18em] text-forest-900">
          Total
        </span>
        <span className="heading-luxe text-2xl">
          {formatPrice(total)}
        </span>
      </div>

      <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-ink-muted">
        Taxes and shipping calculated at checkout
      </p>

      {cart.hasIssues && (
        <div className="mt-6 border border-amber-300 bg-amber-50 p-3">
          <p className="text-xs text-amber-900">
            Some items in your cart have stock issues. Please review before
            checkout.
          </p>
        </div>
      )}

      {showCheckoutButton && (
        <Button
          asChild
          disabled={cart.hasIssues}
          className="mt-6 h-14 w-full rounded-sm bg-forest-900 text-xs uppercase tracking-[0.18em] text-cream-100 hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Link
            href={isGuest || !isAuthenticated ? ROUTES.login : ROUTES.checkout}
            className="flex items-center justify-center gap-2"
          >
            {isGuest || !isAuthenticated ? 'Sign In to Checkout' : 'Proceed to Checkout'}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      )}

      {showCoupon && (
        <p className="mt-4 text-center text-[10px] uppercase tracking-[0.14em] text-ink-muted">
          Coupon code entered at checkout
        </p>
      )}
    </div>
  );
}
