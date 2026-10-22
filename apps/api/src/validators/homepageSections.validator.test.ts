import { describe, it, expect } from 'vitest';
import { updateSectionsSchema } from './homepage.validator';
import { DEFAULT_HOME_SECTIONS } from '../models/homepageSections';

const parse = (sections: unknown) => updateSectionsSchema.safeParse({ body: { sections } });
const firstError = (sections: unknown) => {
  const r = parse(sections);
  return r.success ? null : r.error.issues[0];
};

const rail = (over: Record<string, unknown> = {}) => ({
  id: 'rail',
  type: 'productRail',
  enabled: true,
  title: 'Featured',
  source: 'featured',
  limit: 4,
  ...over,
});

describe('updateSectionsSchema', () => {
  it('accepts the shipped defaults', () => {
    expect(parse(DEFAULT_HOME_SECTIONS).success).toBe(true);
  });

  it('accepts an empty homepage (everything below the hero removed)', () => {
    expect(parse([]).success).toBe(true);
  });

  it('rejects an unknown section type', () => {
    expect(parse([{ id: 'x', type: 'carousel', enabled: true }]).success).toBe(false);
  });

  it('rejects unknown keys on a section', () => {
    expect(parse([rail({ colour: 'red' })]).success).toBe(false);
  });

  it('rejects duplicate section ids', () => {
    const issue = firstError([rail(), rail()]);
    expect(issue?.message).toMatch(/unique/i);
  });

  it('rejects ids that are not short slugs', () => {
    expect(parse([rail({ id: 'Has Spaces' })]).success).toBe(false);
  });

  describe('productRail', () => {
    it('needs a collection when the source is a collection', () => {
      expect(parse([rail({ source: 'collection' })]).success).toBe(false);
      expect(parse([rail({ source: 'collection', collectionId: '507f1f77bcf86cd799439011' })]).success).toBe(true);
    });

    it('needs at least one product when hand-picked', () => {
      expect(parse([rail({ source: 'manual', productIds: [] })]).success).toBe(false);
      expect(parse([rail({ source: 'manual', productIds: ['507f1f77bcf86cd799439011'] })]).success).toBe(true);
    });

    it('rejects malformed product ids', () => {
      expect(parse([rail({ source: 'manual', productIds: ['nope'] })]).success).toBe(false);
    });

    it('bounds the number of products shown', () => {
      expect(parse([rail({ limit: 0 })]).success).toBe(false);
      expect(parse([rail({ limit: 13 })]).success).toBe(false);
    });
  });

  describe('links and media', () => {
    const editorial = (over: Record<string, unknown>) => ({
      id: 'ed',
      type: 'editorial',
      enabled: true,
      variant: 'immersive',
      headline: 'H',
      body: 'B',
      imageUrl: 'https://example.com/a.jpg',
      ...over,
    });

    it('accepts site paths and http(s) links', () => {
      expect(parse([editorial({ cta: { label: 'Go', href: '/shop' } })]).success).toBe(true);
      expect(parse([editorial({ cta: { label: 'Go', href: 'https://example.com' } })]).success).toBe(true);
    });

    it('rejects javascript: and protocol-relative links', () => {
      expect(parse([editorial({ cta: { label: 'Go', href: 'javascript:alert(1)' } })]).success).toBe(false);
      expect(parse([editorial({ cta: { label: 'Go', href: '//evil.com' } })]).success).toBe(false);
    });

    it('only allows http(s) images', () => {
      expect(parse([editorial({ imageUrl: 'data:image/png;base64,AAAA' })]).success).toBe(false);
    });
  });

  it('requires exactly three service cards', () => {
    const services = DEFAULT_HOME_SECTIONS.find((s) => s.type === 'services')!;
    const two = { ...services, services: (services as { services: unknown[] }).services.slice(0, 2) };
    expect(parse([two]).success).toBe(false);
  });

  it('limits bento tiles to seven', () => {
    const tiles = Array.from({ length: 8 }, (_, i) => ({ categorySlug: `cat-${i}` }));
    expect(parse([{ id: 'grid', type: 'categoryBento', enabled: true, title: 'T', tiles }]).success).toBe(false);
  });

  it('limits the number of sections', () => {
    const many = Array.from({ length: 21 }, (_, i) => rail({ id: `rail-${i}` }));
    expect(parse(many).success).toBe(false);
  });
});
