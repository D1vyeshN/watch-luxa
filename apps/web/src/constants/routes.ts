export const ROUTES = {
  // ─── Public ───
  home: '/',
  shop: '/shop',
  newArrivals: '/new-arrivals',
  product: (slug: string) => `/product/${slug}`,
  category: (slug: string) => `/watches/${slug}`,
  collection: (slug: string) => `/collections/${slug}`,
  collections: '/collections',
  brands: '/brands',
  brand: (slug: string) => `/brands/${slug}`,
  search: '/search',
  compare: '/compare',

  // ─── Cart + Checkout ───
  cart: '/cart',
  checkout: '/checkout',
  checkoutSuccess: '/checkout/success',
  trackOrder: (orderNumber: string) => `/track/${orderNumber}`,

  // ─── Auth ───
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',

  // ─── Account ───
  account: '/account',
  accountOrders: '/account/orders',
  accountOrder: (orderNumber: string) =>
    `/account/orders/${orderNumber}`,
  accountWishlist: '/account/wishlist',
  accountAddresses: '/account/addresses',
  accountReturns: '/account/returns',

  // ─── Guest (accessible without login) ───
  wishlist: '/wishlist',

  // ─── Content ───
  journal: '/journal',
  journalPost: (slug: string) => `/journal/${slug}`,
  about: '/about',
  craftsmanship: '/craftsmanship',
  contact: '/contact',
  faq: '/faq',
  warranty: '/warranty',
  stores: '/stores',
  privateViewing: '/private-viewing',
  returns: '/returns',

  // ─── Legal ───
  privacy: '/privacy',
  terms: '/terms',
  shipping: '/shipping',
} as const;

export type RouteKey = keyof typeof ROUTES;
