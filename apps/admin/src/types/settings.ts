// GET /admin/settings — mirrors apps/api/src/models/settings.model.ts.
// Checkout and returns read these values live.
export interface StoreSettings {
  _id: 'global';
  storeName: string;
  contactEmail: string;
  contactPhone: string;
  freeShippingThreshold: number; // paise
  flatShippingFee: number;       // paise
  taxRate: number;               // 0.18 = 18%
  returnWindowDays: number;
  returnsPolicyText?: string;
  updatedAt: string;
}
