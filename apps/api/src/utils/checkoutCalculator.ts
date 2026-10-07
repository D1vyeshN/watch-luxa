// Defaults — the live values come from admin Settings (services/settings.service.ts)
export const SHIPPING_FREE_THRESHOLD = 5_000_000; // ₹50,000 in paise
export const FLAT_SHIPPING_FEE = 50_000;           // ₹500 in paise
export const TAX_RATE = 0.18;                      // 18% GST

export interface CheckoutRates {
  freeShippingThreshold: number; // paise
  flatShippingFee: number;       // paise
  taxRate: number;               // 0.18 = 18%
}

export const DEFAULT_CHECKOUT_RATES: CheckoutRates = {
  freeShippingThreshold: SHIPPING_FREE_THRESHOLD,
  flatShippingFee: FLAT_SHIPPING_FEE,
  taxRate: TAX_RATE,
};

export interface CartLineForCalc {
  price: number;
  quantity: number;
}

export interface CheckoutTotals {
  subtotal: number;
  discount: number;
  tax: number;
  taxRate: number;
  shippingFee: number;
  total: number;
}

/**
 * Calculate order totals from cart items + optional coupon.
 * All amounts in paise.
 */
export const calculateTotals = (
  items: CartLineForCalc[],
  coupon?: { type: 'percentage' | 'fixed'; value: number; maxDiscount?: number },
  rates: CheckoutRates = DEFAULT_CHECKOUT_RATES
): CheckoutTotals => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Discount
  let discount = 0;
  if (coupon) {
    if (coupon.type === 'percentage') {
      discount = Math.round((subtotal * coupon.value) / 100);
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.value;
    }
    discount = Math.min(discount, subtotal);
  }

  const afterDiscount = subtotal - discount;

  // Shipping
  const shippingFee =
    afterDiscount >= rates.freeShippingThreshold ? 0 : rates.flatShippingFee;

  // Tax (on discounted amount, excluding shipping)
  const tax = Math.round(afterDiscount * rates.taxRate);

  const total = afterDiscount + tax + shippingFee;

  return {
    subtotal,
    discount,
    tax,
    taxRate: rates.taxRate,
    shippingFee,
    total,
  };
};
