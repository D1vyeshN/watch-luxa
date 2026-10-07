import mongoose, { Schema, Model } from 'mongoose';

// Store-wide settings: a single document with _id 'global'.
// Defaults match the values that used to be hardcoded in
// utils/checkoutCalculator.ts and services/return.service.ts.
export interface ISettings {
  _id: string;
  storeName: string;
  contactEmail: string;
  contactPhone: string;
  freeShippingThreshold: number; // paise
  flatShippingFee: number;       // paise
  taxRate: number;               // 0.18 = 18%
  returnWindowDays: number;
  returnsPolicyText?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const SETTINGS_ID = 'global';

const SettingsSchema = new Schema<ISettings>(
  {
    _id: { type: String, default: SETTINGS_ID },
    storeName: { type: String, default: 'LUXE', trim: true, minlength: 2, maxlength: 100 },
    contactEmail: { type: String, default: 'hello@luxe.com', trim: true, lowercase: true },
    contactPhone: { type: String, default: '+91 98765 43210', trim: true },
    freeShippingThreshold: { type: Number, default: 5_000_000, min: 0 },
    flatShippingFee: { type: Number, default: 50_000, min: 0 },
    taxRate: { type: Number, default: 0.18, min: 0, max: 1 },
    returnWindowDays: { type: Number, default: 14, min: 0, max: 90 },
    returnsPolicyText: { type: String, maxlength: 2000 },
  },
  { timestamps: true }
);

export const Settings: Model<ISettings> = mongoose.model<ISettings>('Settings', SettingsSchema);
