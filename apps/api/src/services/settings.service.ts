import { Settings, SETTINGS_ID, type ISettings } from '@models/settings.model';

// Checkout reads these on every cart/checkout request, so keep a short
// in-process cache. Updates through this service clear it immediately; the TTL
// only matters if another API instance changed the document.
const CACHE_TTL_MS = 30_000;
let cache: { value: ISettings; at: number } | null = null;

export type SettingsUpdate = Partial<
  Pick<
    ISettings,
    | 'storeName'
    | 'contactEmail'
    | 'contactPhone'
    | 'freeShippingThreshold'
    | 'flatShippingFee'
    | 'taxRate'
    | 'returnWindowDays'
    | 'returnsPolicyText'
  >
>;

export class SettingsService {
  async get(): Promise<ISettings> {
    if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.value;

    // Upsert so a fresh database gets the defaults on first read
    const value = await Settings.findOneAndUpdate(
      { _id: SETTINGS_ID },
      { $setOnInsert: { _id: SETTINGS_ID } },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    ).lean<ISettings>();

    cache = { value: value!, at: Date.now() };
    return value!;
  }

  async update(data: SettingsUpdate): Promise<{ before: ISettings; after: ISettings }> {
    const before = await this.get();
    const after = await Settings.findOneAndUpdate(
      { _id: SETTINGS_ID },
      { $set: data },
      { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }
    ).lean<ISettings>();

    cache = { value: after!, at: Date.now() };
    return { before, after: after! };
  }

  /** The numbers checkout needs — see utils/checkoutCalculator.ts */
  async getCheckoutRates() {
    const s = await this.get();
    return {
      freeShippingThreshold: s.freeShippingThreshold,
      flatShippingFee: s.flatShippingFee,
      taxRate: s.taxRate,
    };
  }
}

export const settingsService = new SettingsService();
