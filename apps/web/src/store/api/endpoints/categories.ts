import { api } from '../api';
import type { ApiResponse } from '@/types/api';
import type { Category } from '@/types/catalog';

export const categoriesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<ApiResponse<Category[]>, void>({
      query: () => '/categories',
      providesTags: ['Category'],
    }),

    getCategory: builder.query<ApiResponse<Category>, string>({
      query: (slug) => `/categories/${slug}`,
      providesTags: (_r, _e, slug) => [{ type: 'Category', id: slug }],
    }),
  }),
});

export const { useGetCategoriesQuery, useGetCategoryQuery } = categoriesApi;
