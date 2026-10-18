import { Homepage, HOMEPAGE_ID, type IHomepage, type IHero } from '@models/homepage.model';
import { env } from '@config/env';
import { logger } from '@config/logger';
import { cacheDelete } from '@utils/cache';
import type { UpdateHeroInput } from '@validators/homepage.validator';

// The storefront /home aggregate reads this on every cache miss, so keep a
// short in-process cache (same approach as settings.service.ts).
const CACHE_TTL_MS = 30_000;
let cache: { value: IHomepage; at: number } | null = null;

export class HomepageService {
  async get(): Promise<IHomepage> {
    if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.value;

    // Upsert so a fresh database gets the default hero on first read
    const value = await Homepage.findOneAndUpdate(
      { _id: HOMEPAGE_ID },
      { $setOnInsert: { _id: HOMEPAGE_ID } },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    ).lean<IHomepage>();

    cache = { value: value!, at: Date.now() };
    return value!;
  }

  async updateHero(hero: UpdateHeroInput): Promise<{ before: IHomepage; after: IHomepage }> {
    const before = await this.get();
    const after = await Homepage.findOneAndUpdate(
      { _id: HOMEPAGE_ID },
      { $set: { hero } },
      { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }
    ).lean<IHomepage>();

    cache = { value: after!, at: Date.now() };
    await cacheDelete('home:aggregate');
    this.revalidateStorefront();
    return { before, after: after! };
  }

  /** What the storefront renders: active slides only */
  async getStorefrontHero() {
    const { hero } = await this.get();
    return toStorefrontHero(hero);
  }

  // Next's ISR keeps the homepage for 5 minutes; ask it to rebuild now.
  // Fire-and-forget — a failure only means the change shows up later.
  private revalidateStorefront() {
    if (!env.WEB_REVALIDATE_URL || !env.REVALIDATE_SECRET) return;

    fetch(env.WEB_REVALIDATE_URL, {
      method: 'POST',
      headers: { 'x-revalidate-secret': env.REVALIDATE_SECRET, 'content-type': 'application/json' },
      body: JSON.stringify({ tag: 'homepage' }),
      signal: AbortSignal.timeout(5000),
    })
      .then((res) => {
        if (!res.ok) logger.warn({ status: res.status }, 'Storefront revalidation rejected');
      })
      .catch((err) => logger.warn({ err }, 'Storefront revalidation failed'));
  }
}

export function toStorefrontHero(hero: IHero) {
  return {
    carouselEnabled: hero.carouselEnabled,
    autoplay: hero.autoplay,
    intervalMs: hero.intervalMs,
    showArrows: hero.showArrows,
    showDots: hero.showDots,
    height: hero.height,
    slides: hero.slides
      .filter((s) => s.isActive)
      .map(({ _id, isActive: _isActive, ...s }) => ({ id: String(_id), ...s })),
  };
}

export const homepageService = new HomepageService();
