export const CONFIG = {
  // ─── Locale ───
  currency: 'INR',
  locale: 'en-IN',
  timezone: 'Asia/Kolkata',

  // ─── Pagination ───
  defaultPageSize: 20,
  maxPageSize: 100,

  // ─── Cart rules ───
  maxCartItems: 50,
  maxItemQuantity: 10,

  // ─── Commerce ───
  freeShippingThreshold: 5_000_000, // ₹50,000 in paise
  flatShippingFee: 50_000, // ₹500 in paise
  taxRate: 0.18, // 18% GST

  // ─── Compare ───
  maxCompareItems: 4,

  // ─── Recently viewed ───
  recentlyViewedLimit: 10,

  // ─── Search ───
  minSearchLength: 2,
  autocompleteLimit: 5,

  // ─── Review ───
  maxReviewImages: 3,
  reviewCommentMinLength: 10,
  reviewCommentMaxLength: 2000,

  // ─── Returns ───
  returnWindowDays: 14,

  // ─── Session ───
  sessionKey: 'luxe_cart_session',
  accessTokenKey: 'luxe_access_token',
  refreshTokenKey: 'luxe_refresh_token',

  // ─── Uploads ───
  maxImageSize: 10 * 1024 * 1024, // 10 MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
} as const;
