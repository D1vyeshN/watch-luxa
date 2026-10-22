import { api } from '../api';
import type { ApiResponse } from '@/types/api';

export type NewsletterSource = 'homepage' | 'footer' | 'other';

export const newsletterApi = api.injectEndpoints({
  endpoints: (builder) => ({
    subscribe: builder.mutation<
      ApiResponse<{ subscribed: boolean }>,
      { email: string; source: NewsletterSource }
    >({
      query: (body) => ({ url: '/newsletter', method: 'POST', body }),
    }),
  }),
});

export const { useSubscribeMutation } = newsletterApi;
