// Homepage sections below the hero: limits, types and the shipped defaults.
// Stored on the Homepage document as an array validated by
// validators/homepage.validator.ts (the only writer). Mirrored in
// apps/web/src/types/home.ts and apps/admin/src/types/homepage.ts.

export const HOME_SECTION_TYPES = [
  'categoryBento',
  'productRail',
  'maison',
  'editorial',
  'services',
  'faq',
] as const;

export const PRODUCT_RAIL_SOURCES = ['featured', 'newest', 'bestselling', 'collection', 'manual'] as const;
export const EDITORIAL_VARIANTS = ['immersive', 'split'] as const;

export const HOME_MAX_SECTIONS = 20;
export const BENTO_MAX_TILES = 7;
export const RAIL_MAX_LIMIT = 12;
export const RAIL_MAX_MANUAL = 12;
export const MAISON_MAX_PILLARS = 4;
export const FAQ_MAX_QUESTIONS = 10;

export interface HomeLink {
  label: string;
  href: string;
}

interface SectionBase {
  id: string;
  enabled: boolean;
}

export type HomeSection = SectionBase &
  (
    | {
        type: 'categoryBento';
        title: string;
        description?: string;
        tiles: { categorySlug: string; imageUrl?: string }[];
      }
    | {
        type: 'productRail';
        title: string;
        description?: string;
        source: (typeof PRODUCT_RAIL_SOURCES)[number];
        collectionId?: string;
        productIds?: string[];
        limit: number;
        viewAll?: HomeLink;
      }
    | {
        type: 'maison';
        headline: string;
        body: string;
        imageUrl: string;
        imageAlt?: string;
        pillars: { title: string; body: string }[];
        cta?: HomeLink;
      }
    | {
        type: 'editorial';
        variant: (typeof EDITORIAL_VARIANTS)[number];
        headline: string;
        body: string;
        imageUrl: string;
        imageAlt?: string;
        reverse?: boolean;
        cta?: HomeLink;
      }
    | {
        type: 'services';
        title: string;
        description?: string;
        backgroundImage?: string;
        services: { title: string; body: string; link: HomeLink }[];
      }
    | {
        type: 'faq';
        title: string;
        description?: string;
        questions: string[];
      }
  );

const unsplash = (id: string, w = 1600) => `https://images.unsplash.com/photo-${id}?w=${w}&q=80`;

/**
 * The homepage as shipped (temporary stock imagery until replaced in admin).
 * Keep in step with DEFAULT_HOME_SECTIONS in apps/web/src/constants/home-sections.ts.
 */
export const DEFAULT_HOME_SECTIONS: HomeSection[] = [
  {
    id: 'collection-grid',
    type: 'categoryBento',
    enabled: true,
    title: 'Explore the Collection',
    description: 'From slim dress pieces to tool watches built for depth and altitude.',
    tiles: [
      { categorySlug: 'dress-watches', imageUrl: unsplash('1524592094714-0f0654e20314') },
      { categorySlug: 'dive-watches', imageUrl: unsplash('1547996160-81dfa63595aa') },
      { categorySlug: 'pilot-watches', imageUrl: unsplash('1548171915-e79a380a2a4b') },
      { categorySlug: 'gmt-watches', imageUrl: unsplash('1587836374828-4dbafa94cf0e', 2000) },
      { categorySlug: 'racing-watches', imageUrl: unsplash('1542496658-e33a6d0d50f6') },
      { categorySlug: 'field-watches', imageUrl: unsplash('1522312346375-d1a52e2b99b3') },
      { categorySlug: 'skeleton-watches', imageUrl: unsplash('1612817159949-195b6eb9e31a', 2000) },
    ],
  },
  {
    id: 'featured',
    type: 'productRail',
    enabled: true,
    title: 'Featured Watches',
    description: 'Chosen by our horologists this season.',
    source: 'featured',
    limit: 4,
    viewAll: { label: 'View all', href: '/shop?featured=true' },
  },
  {
    id: 'maison',
    type: 'maison',
    enabled: true,
    headline: 'Every watch passes a watchmaker’s bench',
    body: 'Before a piece reaches you, our in-house team opens the paperwork, checks the serial and inspects the movement. It is the slow part of what we do, and the part we will never hurry.',
    imageUrl: unsplash('1594534475808-b18fc33b045e', 1200),
    pillars: [
      { title: 'Authenticated in-house', body: 'No replicas, homages or unauthorised editions. Ever.' },
      { title: 'Box and papers', body: 'Original box, papers and warranty card, unless stated otherwise.' },
      { title: '12-month guarantee', body: 'Our own service guarantee, on top of any manufacturer warranty.' },
    ],
    cta: { label: 'Our story', href: '/about' },
  },
  {
    id: 'heritage-elan',
    type: 'editorial',
    enabled: true,
    variant: 'immersive',
    headline: 'Heritage Élan',
    body: "A tribute to the maison's earliest commission. Hand-finished bridges, mirror-polished cases, and dials that catch light the way water catches the sun.",
    imageUrl: unsplash('1539874754764-5a96559165b0', 2000),
    cta: { label: 'Explore heritage', href: '/craftsmanship' },
  },
  {
    id: 'new-arrivals',
    type: 'productRail',
    enabled: true,
    title: 'New Arrivals',
    description: 'The latest additions to the collection.',
    source: 'newest',
    limit: 4,
    viewAll: { label: 'View all', href: '/new-arrivals' },
  },
  {
    id: 'services',
    type: 'services',
    enabled: true,
    title: 'Bought with care, delivered with care',
    description: 'The service around the watch matters as much as the watch.',
    backgroundImage: unsplash('1623091558965-2a339b98698f', 2000),
    services: [
      {
        title: 'Insured delivery',
        body: 'Every order is fully insured in transit and needs a signature on arrival.',
        link: { label: 'Shipping details', href: '/shipping' },
      },
      {
        title: 'Private viewing',
        body: 'A one-on-one session with a LUXE specialist. See pieces up close, try them on, and ask anything.',
        link: { label: 'Book a viewing', href: '/private-viewing' },
      },
      {
        title: '14-day returns',
        body: 'Changed your mind? Return an unworn piece in its original packaging within 14 days.',
        link: { label: 'Returns policy', href: '/returns' },
      },
    ],
  },
  {
    id: 'faq',
    type: 'faq',
    enabled: true,
    title: 'Questions, answered',
    description: 'What people usually ask before buying their first piece from us.',
    questions: [
      'Are all watches authentic?',
      'Do watches come with original box and papers?',
      'Is shipping insured?',
      'What is your return policy?',
      'Do watches carry a warranty?',
    ],
  },
];
