import { api } from '../api';
import type { ApiResponse } from '@/types/api';

// GET /settings — the customer-facing part of the admin's store settings.
// Checkout charges from the same values server-side.
export interface StoreSettings {
  storeName: string;
  contactEmail: string;
  contactPhone: string;
  freeShippingThreshold: number; // paise
  flatShippingFee: number;       // paise
  taxRate: number;               // 0.18 = 18%
  returnWindowDays: number;
  returnsPolicyText: string;
}

export const settingsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStoreSettings: builder.query<ApiResponse<StoreSettings>, void>({
      query: () => '/settings',
      // Rarely changes; one fetch per session is plenty
      keepUnusedDataFor: 600,
    }),
  }),
});

export const { useGetStoreSettingsQuery } = settingsApi;
