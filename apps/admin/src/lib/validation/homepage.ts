import { z } from 'zod';
import { HERO_MAX_SLIDES, HERO_MAX_ZOOM } from '@/types/homepage';

// The form keeps optional text as '' and CTAs as flat label/href pairs;
// hero-form.tsx converts to the API shape (see apps/api/src/validators/homepage.validator.ts).

const httpUrl = (label: string) =>
  z
    .string()
    .trim()
    .refine((v) => v === '' || /^https?:\/\/\S+$/i.test(v), `${label} must be an http(s) URL`);

const isHref = (h: string) => (h.startsWith('/') && !h.startsWith('//')) || /^https?:\/\/\S+$/i.test(h);

const frame = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  zoom: z.number().min(1).max(HERO_MAX_ZOOM),
});

export const heroSlideSchema = z
  .object({
    _id: z.string().optional(),
    isActive: z.boolean(),
    mediaType: z.enum(['image', 'video']),
    imageUrl: httpUrl('Image'),
    mobileImageUrl: httpUrl('Mobile image'),
    imageFrame: frame,
    mobileImageFrame: frame,
    videoUrl: httpUrl('Video'),
    tagline: z.string().trim().max(60, 'Must be under 60 characters'),
    headline: z.string().trim().min(1, 'Headline is required').max(120, 'Must be under 120 characters'),
    subtext: z.string().trim().max(300, 'Must be under 300 characters'),
    primaryLabel: z.string().trim().max(40, 'Must be under 40 characters'),
    primaryHref: z.string().trim().max(500),
    secondaryLabel: z.string().trim().max(40, 'Must be under 40 characters'),
    secondaryHref: z.string().trim().max(500),
    textAlign: z.enum(['left', 'center']),
    overlayOpacity: z.number().int().min(0).max(90),
  })
  .superRefine((s, ctx) => {
    if (!s.imageUrl) {
      ctx.addIssue({
        code: 'custom',
        path: ['imageUrl'],
        message: s.mediaType === 'video' ? 'Add a poster image (shown while the video loads)' : 'Add an image',
      });
    }
    if (s.mediaType === 'video' && !s.videoUrl) {
      ctx.addIssue({ code: 'custom', path: ['videoUrl'], message: 'Upload a video or paste its URL' });
    }
    for (const key of ['primary', 'secondary'] as const) {
      const label = s[`${key}Label`];
      const href = s[`${key}Href`];
      if (label && !href) {
        ctx.addIssue({ code: 'custom', path: [`${key}Href`], message: 'Add a link for this button' });
      } else if (href && !label) {
        ctx.addIssue({ code: 'custom', path: [`${key}Label`], message: 'Add a label for this button' });
      } else if (href && !isHref(href)) {
        ctx.addIssue({ code: 'custom', path: [`${key}Href`], message: 'Use a path like /shop or an http(s) URL' });
      }
    }
  });

export const heroSchema = z.object({
  carouselEnabled: z.boolean(),
  autoplay: z.boolean(),
  intervalSeconds: z
    .number({ error: 'Interval is required' })
    .min(3, 'At least 3 seconds')
    .max(15, 'At most 15 seconds'),
  showArrows: z.boolean(),
  showDots: z.boolean(),
  height: z.enum(['full', 'large', 'medium']),
  slides: z
    .array(heroSlideSchema)
    .min(1, 'Add at least one slide')
    .max(HERO_MAX_SLIDES, `At most ${HERO_MAX_SLIDES} slides`),
});

export type HeroSlideFormSchema = z.infer<typeof heroSlideSchema>;
export type HeroFormSchema = z.infer<typeof heroSchema>;
