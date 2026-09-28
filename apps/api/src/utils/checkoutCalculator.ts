// Business rules — adjust as needed
export const SHIPPING_FREE_THRESHOLD = 5_000_000; // ₹50,000 in paise
export const FLAT_SHIPPING_FEE = 50_000;           // ₹500 in paise
export const TAX_RATE = 0.18;                      // 18% GST

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
  coupon?: { type: 'percentage' | 'fixed'; value: number; maxDiscount?: number }
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
    afterDiscount >= SHIPPING_FREE_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;

  // Tax (on discounted amount, excluding shipping)
  const tax = Math.round(afterDiscount * TAX_RATE);

  const total = afterDiscount + tax + shippingFee;

  return {
    subtotal,
    discount,
    tax,
    taxRate: TAX_RATE,
    shippingFee,
    total,
  };
};
