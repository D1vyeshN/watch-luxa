import { api } from '../api';
import type { ApiResponse } from '@/types/api';
import type { HomeData } from '@/types/home';

export const homeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getHomeData: builder.query<ApiResponse<HomeData>, void>({
      query: () => '/home',
      keepUnusedDataFor: 300,
    }),
  }),
});

export const { useGetHomeDataQuery } = homeApi;
