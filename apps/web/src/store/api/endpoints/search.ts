import { api } from '../api';
import type { ApiResponse } from '@/types/api';
import type { SearchResult, AutocompleteSuggestion } from '@/types/search';

export const searchApi = api.injectEndpoints({
  endpoints: (builder) => ({
    searchProducts: builder.query<ApiResponse<SearchResult>, string>({
      query: (q) => `/search?q=${encodeURIComponent(q)}`,
    }),

    autocomplete: builder.query<
      ApiResponse<AutocompleteSuggestion[]>,
      string
    >({
      query: (q) => `/search/autocomplete?q=${encodeURIComponent(q)}`,
    }),
  }),
});

export const { useSearchProductsQuery, useAutocompleteQuery } = searchApi;
