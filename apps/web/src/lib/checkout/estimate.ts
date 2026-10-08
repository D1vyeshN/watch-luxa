import type { StoreRates } from '@/hooks/useStoreSettings';

// Same rules as calculateTotals in apps/api/src/utils/checkoutCalculator.ts,
// so the cart's estimate matches what checkout charges:
//   shipping is free when the post-discount subtotal reaches the threshold,
//   tax is on the post-discount subtotal (not shipping), rounded to the paisa.
export function estimateTotals(subtotal: number, rates: StoreRates, discount = 0) {
  const afterDiscount = Math.max(0, subtotal - discount);
  const freeShipping = afterDiscount >= rates.freeShippingThreshold;
  const shippingFee = freeShipping ? 0 : rates.flatShippingFee;
  const tax = Math.round(afterDiscount * rates.taxRate);

  return {
    afterDiscount,
    freeShipping,
    freeShippingRemaining: freeShipping ? 0 : rates.freeShippingThreshold - afterDiscount,
    shippingFee,
    tax,
    taxRate: rates.taxRate,
    total: afterDiscount + shippingFee + tax,
  };
}

/** "18%" / "12.5%" */
export const formatTaxRate = (rate: number) => `${Math.round(rate * 10_000) / 100}%`;
