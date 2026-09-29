export const MESSAGES = {
  errors: {
    // ─── Network ───
    network: 'Please check your connection and try again.',
    generic: 'Something went wrong. Please try again.',
    serverError: 'Our servers are having trouble. Please try again shortly.',

    // ─── Auth ───
    sessionExpired: 'Your session has expired. Please sign in again.',
    unauthorized: 'You need to sign in to continue.',
    invalidCredentials: 'Invalid email or password.',

    // ─── Cart ───
    cartEmpty: 'Your cart is empty.',
    cartFull: 'Your cart is full.',
    stockUnavailable: 'This item is no longer available.',
    insufficientStock: 'Only a limited quantity is available.',

    // ─── Checkout ───
    invalidCoupon: 'This coupon is invalid or has expired.',
    paymentFailed: 'Payment failed. Please try again.',
    orderFailed: 'We could not process your order.',

    // ─── Product ───
    productNotFound: 'This product is no longer available.',
    variantOutOfStock: 'This variant is out of stock.',

    // ─── Validation ───
    requiredField: 'This field is required.',
    invalidEmail: 'Please enter a valid email address.',
    passwordTooShort: 'Password must be at least 8 characters.',
  },

  success: {
    // ─── Cart ───
    addedToCart: 'Added to cart',
    removedFromCart: 'Removed from cart',
    cartUpdated: 'Cart updated',

    // ─── Wishlist ───
    addedToWishlist: 'Added to wishlist',
    removedFromWishlist: 'Removed from wishlist',

    // ─── Checkout ───
    orderPlaced: 'Order placed successfully',
    couponApplied: 'Coupon applied',

    // ─── Auth ───
    loginSuccess: 'Welcome back',
    registerSuccess: 'Account created successfully',
    logoutSuccess: 'Signed out',
  },

  empty: {
    cart: 'Your cart is empty',
    wishlist: 'Your wishlist is empty',
    orders: 'You have no orders yet',
    search: 'No results found',
    products: 'No products available',
  },
} as const;
