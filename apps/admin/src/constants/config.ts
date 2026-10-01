export const CONFIG = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL!,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL!,
  siteName: process.env.NEXT_PUBLIC_SITE_NAME!,

  // localStorage keys (admin-specific, separate from storefront)
  accessTokenKey: 'luxe_admin_access_token',
  refreshTokenKey: 'luxe_admin_refresh_token',
  userKey: 'luxe_admin_user',

  // Pagination
  defaultPageSize: 20,
  maxPageSize: 100,

  // Admin API prefix
  adminPrefix: '/admin',
} as const;
