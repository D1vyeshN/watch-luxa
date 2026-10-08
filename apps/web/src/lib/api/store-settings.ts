import { serverFetch } from './server-fetch';
import { CONFIG } from '@/constants/config';
import type { ApiResponse } from '@/types/api';
import type { StoreSettings } from '@/store/api/endpoints/settings';

// Server components: live store settings (shipping, tax, returns) with the
// CONFIG defaults as a fallback if the API is unreachable. Client components
// use the useStoreSettings() hook instead.
export async function getStoreSettings() {
  const res = await serverFetch<ApiResponse<StoreSettings>>('/settings', { revalidate: 60 });
  const s = res?.data;
  return {
    freeShippingThreshold: s?.freeShippingThreshold ?? CONFIG.freeShippingThreshold,
    flatShippingFee: s?.flatShippingFee ?? CONFIG.flatShippingFee,
    taxRate: s?.taxRate ?? CONFIG.taxRate,
    returnWindowDays: s?.returnWindowDays ?? 14,
  };
}
