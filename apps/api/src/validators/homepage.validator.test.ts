import { describe, it, expect } from 'vitest';
import { updateHeroSchema } from './homepage.validator';

const slide = (overrides: Record<string, unknown> = {}) => ({
  isActive: true,
  mediaType: 'image',
  imageUrl: 'https://example.com/hero.webp',
  headline: 'Time, Refined.',
  textAlign: 'left',
  overlayOpacity: 75,
  ...overrides,
});

const hero = (overrides: Record<string, unknown> = {}) => ({
  body: {
    carouselEnabled: true,
    autoplay: true,
    intervalMs: 6000,
    showArrows: true,
    showDots: true,
    height: 'full',
    slides: [slide()],
    ...overrides,
  },
});

describe('Homepage Validators', () => {
  describe('updateHeroSchema', () => {
    it('should accept a valid hero', () => {
      const data = hero({
        slides: [
          slide({
            _id: '507f1f77bcf86cd799439011',
            tagline: 'LUXE',
            subtext: 'Precision crafted.',
            primaryCta: { label: 'Shop', href: '/shop' },
            secondaryCta: { label: 'Journal', href: 'https://example.com/journal' },
          }),
          slide({ mediaType: 'video', videoUrl: 'https://example.com/hero.mp4' }),
        ],
      });
      expect(() => updateHeroSchema.parse(data)).not.toThrow();
    });

    it('should reject a video slide without a video URL', () => {
      expect(() => updateHeroSchema.parse(hero({ slides: [slide({ mediaType: 'video' })] }))).toThrow();
    });

    it('should reject more than 8 slides', () => {
      const slides = Array.from({ length: 9 }, () => slide());
      expect(() => updateHeroSchema.parse(hero({ slides }))).toThrow();
    });

    it('should reject an empty slide list', () => {
      expect(() => updateHeroSchema.parse(hero({ slides: [] }))).toThrow();
    });

    it('should reject unknown keys', () => {
      expect(() => updateHeroSchema.parse(hero({ isAdmin: true }))).toThrow();
      expect(() => updateHeroSchema.parse(hero({ slides: [slide({ extra: 1 })] }))).toThrow();
    });

    it('should reject unsafe CTA links', () => {
      for (const href of ['javascript:alert(1)', '//evil.com', 'data:text/html,hi', 'shop']) {
        const data = hero({ slides: [slide({ primaryCta: { label: 'Go', href } })] });
        expect(() => updateHeroSchema.parse(data), href).toThrow();
      }
    });

    it('should reject non-http media URLs', () => {
      expect(() =>
        updateHeroSchema.parse(hero({ slides: [slide({ imageUrl: 'javascript:alert(1)' })] }))
      ).toThrow();
    });

    it('should accept image framing and enforce its bounds', () => {
      const framed = (f: Record<string, unknown>) =>
        hero({ slides: [slide({ imageFrame: { x: 30, y: 70, zoom: 1.5 }, mobileImageFrame: f })] });
      expect(() => updateHeroSchema.parse(framed({ x: 50, y: 50, zoom: 1 }))).not.toThrow();
      expect(() => updateHeroSchema.parse(framed({ x: 101, y: 50, zoom: 1 }))).toThrow();
      expect(() => updateHeroSchema.parse(framed({ x: 50, y: 50, zoom: 0.5 }))).toThrow();
      expect(() => updateHeroSchema.parse(framed({ x: 50, y: 50, zoom: 4 }))).toThrow();
      expect(() => updateHeroSchema.parse(framed({ x: 50, y: 50, zoom: 1, rotate: 90 }))).toThrow();
    });

    it('should enforce interval and overlay bounds', () => {
      expect(() => updateHeroSchema.parse(hero({ intervalMs: 1000 }))).toThrow();
      expect(() => updateHeroSchema.parse(hero({ slides: [slide({ overlayOpacity: 95 })] }))).toThrow();
    });
  });
});
