import { api } from '../api';
import type { ApiResponse } from '@/types/api';
import type { Product } from '@/types/catalog';

interface WishlistResponse {
  productIds: string[];
  products: Product[];
  count: number;
}

interface ToggleResponse {
  added: boolean;
  inWishlist: boolean;
  count: number;
}

export const wishlistApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getWishlist: builder.query<ApiResponse<WishlistResponse>, void>({
      query: () => '/wishlist',
      providesTags: ['Wishlist'],
    }),

    toggleWishlist: builder.mutation<
      ApiResponse<ToggleResponse>,
      { productId: string }
    >({
      query: (body) => ({ url: '/wishlist/toggle', method: 'POST', body }),
      invalidatesTags: ['Wishlist'],
    }),

    checkWishlist: builder.query<
      ApiResponse<{ inWishlist: boolean }>,
      string
    >({
      query: (productId) => `/wishlist/check/${productId}`,
      providesTags: (_r, _e, productId) => [
        { type: 'Wishlist', id: productId },
      ],
    }),
  }),
});

export const {
  useGetWishlistQuery,
  useToggleWishlistMutation,
  useCheckWishlistQuery,
} = wishlistApi;
