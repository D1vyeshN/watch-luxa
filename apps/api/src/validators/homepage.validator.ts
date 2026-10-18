import { z } from 'zod';
import {
  HERO_MAX_SLIDES,
  HERO_HEIGHTS,
  HERO_MEDIA_TYPES,
  HERO_TEXT_ALIGNS,
  HERO_MAX_ZOOM,
} from '../models/homepage.model'; // relative: vitest has no path aliases

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
