type EventName =
  | 'page_view'
  | 'product_view'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'begin_checkout'
  | 'purchase'
  | 'search'
  | 'wishlist_add'
  | 'wishlist_remove'
  | 'login'
  | 'register';

interface TrackPayload {
  [key: string]: string | number | boolean | undefined;
}

const isDev = process.env.NODE_ENV === 'development';

export function track(event: EventName, payload: TrackPayload = {}): void {
  if (isDev) {
    console.log(`[analytics] ${event}`, payload);
    return;
  }

  // Production: wire this to Plausible, Vercel Analytics, or GA4
  // window.plausible?.(event, { props: payload });
}

/**
 * Convenience wrappers for common events.
 */
export const analytics = {
  productView: (productId: string, slug: string) =>
    track('product_view', { productId, slug }),

  addToCart: (productId: string, variantId: string, price: number) =>
    track('add_to_cart', { productId, variantId, price }),

  beginCheckout: (itemCount: number, subtotal: number) =>
    track('begin_checkout', { itemCount, subtotal }),

  purchase: (orderId: string, total: number, itemCount: number) =>
    track('purchase', { orderId, total, itemCount }),

  search: (query: string, resultCount: number) =>
    track('search', { query, resultCount }),
};
