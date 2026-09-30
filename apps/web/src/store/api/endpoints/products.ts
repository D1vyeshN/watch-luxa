import { api } from '../api';
import type { ApiResponse, Paginated } from '@/types/api';
import type { Product, ProductFilters } from '@/types/catalog';

function buildQuery(params: Record<string, unknown>): string {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      if (value.length) qs.set(key, value.join(','));
    } else {
      qs.set(key, String(value));
    }
  });
  const str = qs.toString();
  return str ? `?${str}` : '';
}

export const productsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<Paginated<Product>, ProductFilters>({
      query: (filters) => `/products${buildQuery(filters as Record<string, unknown>)}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((p) => ({
                type: 'Product' as const,
                id: p.id,
              })),
              { type: 'Product' as const, id: 'LIST' },
            ]
          : [{ type: 'Product' as const, id: 'LIST' }],
    }),

    getProduct: builder.query<ApiResponse<Product>, string>({
      query: (slug) => `/products/${slug}`,
      providesTags: (_r, _e, slug) => [{ type: 'Product', id: slug }],
    }),

    getRelatedProducts: builder.query<
      ApiResponse<Product[]>,
      { slug: string; limit?: number }
    >({
      query: ({ slug, limit = 6 }) => `/products/${slug}/related?limit=${limit}`,
    }),

    getNewArrivals: builder.query<ApiResponse<Product[]>, number | void>({
      query: (limit = 8) => `/products/new-arrivals?limit=${limit}`,
    }),

    getFeaturedProducts: builder.query<ApiResponse<Product[]>, number | void>({
      query: (limit = 8) => `/products/featured?limit=${limit}`,
    }),

    getTrendingProducts: builder.query<ApiResponse<Product[]>, number | void>({
      query: (limit = 8) => `/products/trending?limit=${limit}`,
    }),

    compareProducts: builder.query<ApiResponse<Product[]>, string[]>({
      query: (ids) => `/products/compare?ids=${ids.join(',')}`,
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useGetRelatedProductsQuery,
  useGetNewArrivalsQuery,
  useGetFeaturedProductsQuery,
  useGetTrendingProductsQuery,
  useCompareProductsQuery,
} = productsApi;
