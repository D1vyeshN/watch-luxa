import { z } from 'zod';
import {
  HERO_MAX_SLIDES,
  HERO_HEIGHTS,
  HERO_MEDIA_TYPES,
  HERO_TEXT_ALIGNS,
  HERO_MAX_ZOOM,
} from '../models/homepage.model'; // relative: vitest has no path aliases
import {
  PRODUCT_RAIL_SOURCES,
  EDITORIAL_VARIANTS,
  HOME_MAX_SECTIONS,
  BENTO_MAX_TILES,
  RAIL_MAX_LIMIT,
  RAIL_MAX_MANUAL,
  MAISON_MAX_PILLARS,
  FAQ_MAX_QUESTIONS,
} from '../models/homepageSections';

// Rendered as src/href on the storefront: only http(s) — never javascript:/data:
const mediaUrl = z
  .string()
  .trim()
  .url()
  .refine((u) => /^https?:\/\//i.test(u), 'Must be an http(s) URL');

// Same-site path ('/shop') or an absolute http(s) link. '//evil.com' is
// protocol-relative, so it's rejected along with javascript: and friends.
const ctaHref = z
  .string()
  .trim()
  .max(500)
  .refine(
    (h) => (h.startsWith('/') && !h.startsWith('//')) || /^https?:\/\/[^\s]+$/i.test(h),
    'Must be a path like /shop or an http(s) URL'
  );

const cta = z
  .object({
    label: z.string().trim().min(1).max(40),
    href: ctaHref,
  })
  .strict();

const frame = z
  .object({
    x: z.number().min(0).max(100),
    y: z.number().min(0).max(100),
    zoom: z.number().min(1).max(HERO_MAX_ZOOM),
  })
  .strict();

const slide = z
  .object({
    _id: z.string().regex(/^[a-f\d]{24}$/i).optional(),
    isActive: z.boolean(),
    mediaType: z.enum(HERO_MEDIA_TYPES),
    imageUrl: mediaUrl,
    mobileImageUrl: mediaUrl.optional(),
    imageFrame: frame.optional(),
    mobileImageFrame: frame.optional(),
    videoUrl: mediaUrl.optional(),
    tagline: z.string().trim().max(60).optional(),
    headline: z.string().trim().min(1).max(120),
    subtext: z.string().trim().max(300).optional(),
    primaryCta: cta.optional(),
    secondaryCta: cta.optional(),
    textAlign: z.enum(HERO_TEXT_ALIGNS),
    overlayOpacity: z.number().int().min(0).max(90),
  })
  .strict()
  .superRefine((s, ctx) => {
    if (s.mediaType === 'video' && !s.videoUrl) {
      ctx.addIssue({ code: 'custom', path: ['videoUrl'], message: 'Video slides need a video' });
    }
  });

export const updateHeroSchema = z.object({
  body: z
    .object({
      carouselEnabled: z.boolean(),
      autoplay: z.boolean(),
      intervalMs: z.number().int().min(3000).max(15000),
      showArrows: z.boolean(),
      showDots: z.boolean(),
      height: z.enum(HERO_HEIGHTS),
      slides: z.array(slide).min(1).max(HERO_MAX_SLIDES),
    })
    // The whole hero is replaced, so unknown keys would land on the document
    .strict(),
});

export type UpdateHeroInput = z.infer<typeof updateHeroSchema>['body'];

// ─── Sections below the hero ───

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const shortText = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) => z.string().trim().max(max).optional();

const sectionBase = {
  // Stable key for React and the admin list — a short slug
  id: z.string().regex(/^[a-z0-9][a-z0-9-]{0,39}$/, 'Use lowercase letters, numbers and dashes'),
  enabled: z.boolean(),
};

const categoryBento = z
  .object({
    ...sectionBase,
    type: z.literal('categoryBento'),
    title: shortText(80),
    description: optionalText(200),
    tiles: z
      .array(
        z
          .object({
            categorySlug: z.string().regex(/^[a-z0-9-]{1,80}$/, 'Invalid category'),
            imageUrl: mediaUrl.optional(),
          })
          .strict()
      )
      .max(BENTO_MAX_TILES),
  })
  .strict();

const productRail = z
  .object({
    ...sectionBase,
    type: z.literal('productRail'),
    title: shortText(80),
    description: optionalText(200),
    source: z.enum(PRODUCT_RAIL_SOURCES),
    collectionId: objectId.optional(),
    productIds: z.array(objectId).max(RAIL_MAX_MANUAL).optional(),
    limit: z.number().int().min(1).max(RAIL_MAX_LIMIT),
    viewAll: cta.optional(),
  })
  .strict()
  .superRefine((s, ctx) => {
    if (s.source === 'collection' && !s.collectionId) {
      ctx.addIssue({ code: 'custom', path: ['collectionId'], message: 'Choose a collection' });
    }
    if (s.source === 'manual' && !s.productIds?.length) {
      ctx.addIssue({ code: 'custom', path: ['productIds'], message: 'Pick at least one product' });
    }
  });

const maison = z
  .object({
    ...sectionBase,
    type: z.literal('maison'),
    headline: shortText(120),
    body: shortText(600),
    imageUrl: mediaUrl,
    imageAlt: optionalText(200),
    pillars: z
      .array(z.object({ title: shortText(60), body: shortText(200) }).strict())
      .max(MAISON_MAX_PILLARS),
    cta: cta.optional(),
  })
  .strict();

const editorial = z
  .object({
    ...sectionBase,
    type: z.literal('editorial'),
    variant: z.enum(EDITORIAL_VARIANTS),
    headline: shortText(120),
    body: shortText(600),
    imageUrl: mediaUrl,
    imageAlt: optionalText(200),
    reverse: z.boolean().optional(),
    cta: cta.optional(),
  })
  .strict();

const serviceCard = z
  .object({ title: shortText(60), body: shortText(240), link: cta })
  .strict();

const services = z
  .object({
    ...sectionBase,
    type: z.literal('services'),
    title: shortText(120),
    description: optionalText(200),
    backgroundImage: mediaUrl.optional(),
    // The layout is three cards with the middle one offset
    services: z.tuple([serviceCard, serviceCard, serviceCard]),
  })
  .strict();

const faq = z
  .object({
    ...sectionBase,
    type: z.literal('faq'),
    title: shortText(120),
    description: optionalText(200),
    // Question text from the storefront FAQ page; unknown ones are skipped there
    questions: z.array(shortText(200)).min(1).max(FAQ_MAX_QUESTIONS),
  })
  .strict();

const section = z.discriminatedUnion('type', [
  categoryBento,
  productRail,
  maison,
  editorial,
  services,
  faq,
]);

export const updateSectionsSchema = z.object({
  body: z
    .object({
      sections: z
        .array(section)
        .max(HOME_MAX_SECTIONS)
        .superRefine((list, ctx) => {
          const seen = new Set<string>();
          list.forEach((s, i) => {
            if (seen.has(s.id)) {
              ctx.addIssue({ code: 'custom', path: [i, 'id'], message: 'Section ids must be unique' });
            }
            seen.add(s.id);
          });
        }),
    })
    // The whole list is replaced, so unknown keys would land on the document
    .strict(),
});

export type UpdateSectionsInput = z.infer<typeof updateSectionsSchema>['body'];
