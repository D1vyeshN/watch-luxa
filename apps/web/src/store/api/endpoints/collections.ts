import { api } from '../api';
import type { ApiResponse } from '@/types/api';
import type { Collection } from '@/types/catalog';

export const collectionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCollections: builder.query<
      ApiResponse<Collection[]>,
      { featured?: boolean } | void
    >({
      query: (params) => {
        const qs = params?.featured ? '?featured=true' : '';
        return `/collections${qs}`;
      },
      providesTags: ['Collection'],
    }),

    getCollection: builder.query<ApiResponse<Collection>, string>({
      query: (slug) => `/collections/${slug}`,
      providesTags: (_r, _e, slug) => [{ type: 'Collection', id: slug }],
    }),
  }),
});

export const { useGetCollectionsQuery, useGetCollectionQuery } = collectionsApi;
