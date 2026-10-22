import { z } from 'zod';
import {
  BENTO_MAX_TILES,
  FAQ_MAX_QUESTIONS,
  HOME_MAX_SECTIONS,
  MAISON_MAX_PILLARS,
  RAIL_MAX_LIMIT,
  RAIL_MAX_MANUAL,
} from '@/types/homepage';

// Client copy of the API's updateSectionsSchema
// (apps/api/src/validators/homepage.validator.ts) with editor-friendly
// messages. The API re-validates; this just catches problems before saving.

const isHref = (h: string) => (h.startsWith('/') && !h.startsWith('//')) || /^https?:\/\/\S+$/i.test(h);

const required = (label: string, max: number) =>
  z.string().trim().min(1, `${label} is required`).max(max, `${label}: at most ${max} characters`);
const optional = (label: string, max: number) =>
  z.string().trim().max(max, `${label}: at most ${max} characters`).optional();

const image = (label: string) =>
  z.string().trim().refine((v) => /^https?:\/\/\S+$/i.test(v), `${label}: upload an image`);

const link = z.object({
  label: required('Button label', 40),
  href: z.string().trim().refine(isHref, 'Link must be a path like /shop or an http(s) URL'),
});

const objectId = z.string().regex(/^[a-f\d]{24}$/i);

const base = {
  id: z.string().regex(/^[a-z0-9][a-z0-9-]{0,39}$/),
  enabled: z.boolean(),
};

const section = z.discriminatedUnion('type', [
  z.object({
    ...base,
    type: z.literal('categoryBento'),
    title: required('Title', 80),
    description: optional('Description', 200),
    tiles: z
      .array(z.object({ categorySlug: z.string().min(1, 'Choose a category'), imageUrl: image('Tile image').optional() }))
      .max(BENTO_MAX_TILES, `At most ${BENTO_MAX_TILES} tiles`),
  }),
  z
    .object({
      ...base,
      type: z.literal('productRail'),
      title: required('Title', 80),
      description: optional('Description', 200),
      source: z.enum(['featured', 'newest', 'bestselling', 'collection', 'manual']),
      collectionId: objectId.optional(),
      productIds: z.array(objectId).max(RAIL_MAX_MANUAL, `At most ${RAIL_MAX_MANUAL} products`).optional(),
      limit: z.number().int().min(1, 'Show at least 1').max(RAIL_MAX_LIMIT, `At most ${RAIL_MAX_LIMIT}`),
      viewAll: link.optional(),
    })
    .superRefine((s, ctx) => {
      if (s.source === 'collection' && !s.collectionId) {
        ctx.addIssue({ code: 'custom', path: ['collectionId'], message: 'Choose a collection' });
      }
      if (s.source === 'manual' && !s.productIds?.length) {
        ctx.addIssue({ code: 'custom', path: ['productIds'], message: 'Pick at least one product' });
      }
    }),
  z.object({
    ...base,
    type: z.literal('maison'),
    headline: required('Headline', 120),
    body: required('Text', 600),
    imageUrl: image('Image'),
    imageAlt: optional('Image description', 200),
    pillars: z
      .array(z.object({ title: required('Pillar title', 60), body: required('Pillar text', 200) }))
      .max(MAISON_MAX_PILLARS),
    cta: link.optional(),
  }),
  z.object({
    ...base,
    type: z.literal('editorial'),
    variant: z.enum(['immersive', 'split']),
    headline: required('Headline', 120),
    body: required('Text', 600),
    imageUrl: image('Image'),
    imageAlt: optional('Image description', 200),
    reverse: z.boolean().optional(),
    cta: link.optional(),
  }),
  z.object({
    ...base,
    type: z.literal('services'),
    title: required('Title', 120),
    description: optional('Description', 200),
    backgroundImage: image('Background image').optional(),
    services: z.tuple([
      z.object({ title: required('Card title', 60), body: required('Card text', 240), link }),
      z.object({ title: required('Card title', 60), body: required('Card text', 240), link }),
      z.object({ title: required('Card title', 60), body: required('Card text', 240), link }),
    ]),
  }),
  z.object({
    ...base,
    type: z.literal('faq'),
    title: required('Title', 120),
    description: optional('Description', 200),
    questions: z
      .array(z.string())
      .min(1, 'Pick at least one question')
      .max(FAQ_MAX_QUESTIONS, `At most ${FAQ_MAX_QUESTIONS} questions`),
  }),
]);

export const sectionsSchema = z.array(section).max(HOME_MAX_SECTIONS, `At most ${HOME_MAX_SECTIONS} sections`);

/** Errors grouped by section index: { 2: ['Title is required', …] } */
export function sectionErrors(sections: unknown): Map<number, string[]> {
  const result = sectionsSchema.safeParse(sections);
  const errors = new Map<number, string[]>();
  if (result.success) return errors;
  for (const issue of result.error.issues) {
    const index = typeof issue.path[0] === 'number' ? issue.path[0] : -1;
    errors.set(index, [...(errors.get(index) ?? []), issue.message]);
  }
  return errors;
}
