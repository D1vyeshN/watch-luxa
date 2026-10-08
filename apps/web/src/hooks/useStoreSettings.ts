'use client';

import { useGetStoreSettingsQuery } from '@/store/api/endpoints/settings';
import { CONFIG } from '@/constants/config';

// Live shipping / tax / returns values from admin Settings. Until they load
// (or if the request fails) fall back to the defaults in CONFIG, which match
// the API's defaults.
//
// For text that's server-rendered (shows before hydration), fetch with
// getStoreSettings() in the server component and pass it down instead —
// otherwise the server renders the fallback and hydration mismatches.
export function useStoreSettings() {
  const { data } = useGetStoreSettingsQuery();
  const s = data?.data;

  return {
    freeShippingThreshold: s?.freeShippingThreshold ?? CONFIG.freeShippingThreshold,
    flatShippingFee: s?.flatShippingFee ?? CONFIG.flatShippingFee,
    taxRate: s?.taxRate ?? CONFIG.taxRate,
    returnWindowDays: s?.returnWindowDays ?? 14,
    isLoaded: Boolean(s),
  };
}

export type StoreRates = Pick<
  ReturnType<typeof useStoreSettings>,
  'freeShippingThreshold' | 'flatShippingFee' | 'taxRate'
>;
