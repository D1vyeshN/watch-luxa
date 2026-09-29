import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export const TAG_TYPES = [
  'Product',
  'Brand',
  'Category',
  'Collection',
  'Cart',
  'Wishlist',
  'Order',
  'User',
  'Review',
  'Return',
  'Coupon',
] as const;

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: TAG_TYPES,
  // Endpoints are injected per domain via `api.injectEndpoints` 
  endpoints: () => ({}),
});

export type TagType = (typeof TAG_TYPES)[number];
