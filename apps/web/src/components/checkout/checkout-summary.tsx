'use client';

import { Separator } from '@/components/ui/separator';
import { CouponInput } from '@/components/cart';
import { formatPrice } from '@/lib/format';
import { CONFIG } from '@/constants/config';
import type { Cart } from '@/types/cart';

interface CheckoutSummaryProps {
  cart: Cart;
  couponCode?: string;
  couponDiscount?: number;
  couponError?: string | null;
  isApplyingCoupon?: boolean;
  onApplyCoupon?: (code: string) => void;
  onRemoveCoupon?: () => void;
}

export function CheckoutSummary({
  cart,
  couponCode,
  couponDiscount = 0,
  couponError,
  isApplyingCoupon,
  onApplyCoupon,
  onRemoveCoupon,
}: CheckoutSummaryProps) {
  const subtotal = cart.subtotal;
  const afterDiscount = subtotal - couponDiscount;
  const freeShipping = afterDiscount >= CONFIG.freeShippingThreshold;
  const shippingFee = freeShipping ? 0 : CONFIG.flatShippingFee;
  const estimatedTax = Math.round(afterDiscount * CONFIG.taxRate);
  const total = afterDiscount + shippingFee + estimatedTax;

  return (
    <div className="border border-forest-900/10 bg-cream-100 p-6 md:p-8">
      <h2 className="heading-luxe text-xl">Order Summary</h2>

      {/* Items preview */}
      <div className="mt-6 space-y-3">
        {cart.items.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between gap-3 text-sm"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-forest-900">{item.productName}</p>
              <p className="text-xs text-ink-muted">
                {item.variantLabel} · Qty {item.quantity}
              </p>
            </div>
            <span className="shrink-0 text-forest-900">
              {formatPrice(item.lineTotal)}
            </span>
          </div>
        ))}
      </div>

      <Separator className="my-5 bg-forest-900/10" />

      {/* Coupon */}
      <CouponInput
        appliedCode={couponCode}
        onApply={onApplyCoupon}
        onRemove={onRemoveCoupon}
        isApplying={isApplyingCoupon}
        error={couponError}
      />

      <Separator className="my-5 bg-forest-900/10" />

      {/* Totals */}
      <dl className="space-y-2.5 text-sm">
        <Row label="Subtotal" value={formatPrice(subtotal)} />

        {couponDiscount > 0 && (
          <Row
            label="Discount"
            value={`−${formatPrice(couponDiscount)}`}
            valueClassName="text-green-700"
          />
        )}

        <Row
          label="Shipping"
          value={freeShipping ? 'Free' : formatPrice(shippingFee)}
        />

        <Row
          label={`GST (${(CONFIG.taxRate * 100).toFixed(0)}%)`}
          value={formatPrice(estimatedTax)}
        />
      </dl>

      <Separator className="my-5 bg-forest-900/10" />

      <div className="flex items-baseline justify-between">
        <span className="text-xs uppercase tracking-[0.18em] text-forest-900">
          Total
        </span>
        <span className="heading-luxe text-2xl">
          {formatPrice(total)}
        </span>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink-soft">{label}</dt>
      <dd className={valueClassName ?? 'font-medium text-forest-900'}>
        {value}
      </dd>
    </div>
  );
}
