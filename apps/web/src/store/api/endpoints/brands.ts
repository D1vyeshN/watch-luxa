import { api } from '../api';
import type { ApiResponse, Paginated } from '@/types/api';
import type { Brand } from '@/types/catalog';

export const brandsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBrands: builder.query<
      Paginated<Brand>,
      { page?: number; limit?: number; featured?: boolean } | void
    >({
      query: (params) => {
        const qs = new URLSearchParams();
        if (params?.page) qs.set('page', String(params.page));
        if (params?.limit) qs.set('limit', String(params.limit));
        if (params?.featured) qs.set('featured', 'true');
        const str = qs.toString();
        return `/brands${str ? `?${str}` : ''}`;
      },
      providesTags: ['Brand'],
    }),

    getBrand: builder.query<ApiResponse<Brand>, string>({
      query: (slug) => `/brands/${slug}`,
      providesTags: (_r, _e, slug) => [{ type: 'Brand', id: slug }],
    }),
  }),
});

export const { useGetBrandsQuery, useGetBrandQuery } = brandsApi;
