// GET /admin/homepage — mirrors apps/api/src/models/homepage.model.ts.
// The storefront homepage hero renders from this.

export type HeroHeight = 'full' | 'large' | 'medium';
export type HeroMediaType = 'image' | 'video';
export type HeroTextAlign = 'left' | 'center';

export interface HeroCta {
  label: string;
  href: string;
}

// Focal point (0–100 %) + zoom (1 = cover). The uploaded file is never cropped.
export interface ImageFrame {
  x: number;
  y: number;
  zoom: number;
}

export const DEFAULT_FRAME: ImageFrame = { x: 50, y: 50, zoom: 1 };
export const HERO_MAX_ZOOM = 3;

export interface HeroSlide {
  _id: string;
  isActive: boolean;
  mediaType: HeroMediaType;
  imageUrl: string;        // image slides; poster for video slides
  mobileImageUrl?: string;
  imageFrame?: ImageFrame;       // desktop
  mobileImageFrame?: ImageFrame; // phones (mobile image, or desktop image when none)
  videoUrl?: string;
  tagline?: string;
  headline: string;
  subtext?: string;
  primaryCta?: HeroCta;
  secondaryCta?: HeroCta;
  textAlign: HeroTextAlign;
  overlayOpacity: number;  // 0–90 (%)
}

export interface HeroConfig {
  carouselEnabled: boolean;
  autoplay: boolean;
  intervalMs: number;
  showArrows: boolean;
  showDots: boolean;
  height: HeroHeight;
  slides: HeroSlide[];
}

export interface HomepageContent {
  _id: 'global';
  hero: HeroConfig;
  /** The API falls back to its defaults until sections are first saved */
  sections: HomeSection[];
  updatedAt: string;
}

export const HERO_MAX_SLIDES = 8;

// ─── Sections below the hero ───
// Mirrors apps/api/src/models/homepageSections.ts (limits and shapes).

export interface HomeLink {
  label: string;
  href: string;
}

interface SectionBase {
  id: string;
  enabled: boolean;
}

export type ProductRailSource = 'featured' | 'newest' | 'bestselling' | 'collection' | 'manual';

export interface CategoryBentoSection extends SectionBase {
  type: 'categoryBento';
  title: string;
  description?: string;
  tiles: { categorySlug: string; imageUrl?: string }[];
}

export interface ProductRailSection extends SectionBase {
  type: 'productRail';
  title: string;
  description?: string;
  source: ProductRailSource;
  collectionId?: string;
  productIds?: string[];
  limit: number;
  viewAll?: HomeLink;
}

export interface MaisonSection extends SectionBase {
  type: 'maison';
  headline: string;
  body: string;
  imageUrl: string;
  imageAlt?: string;
  pillars: { title: string; body: string }[];
  cta?: HomeLink;
}

export interface EditorialSection extends SectionBase {
  type: 'editorial';
  variant: 'immersive' | 'split';
  headline: string;
  body: string;
  imageUrl: string;
  imageAlt?: string;
  reverse?: boolean;
  cta?: HomeLink;
}

export interface ServiceCard {
  title: string;
  body: string;
  link: HomeLink;
}

export interface ServicesSection extends SectionBase {
  type: 'services';
  title: string;
  description?: string;
  backgroundImage?: string;
  services: [ServiceCard, ServiceCard, ServiceCard];
}

export interface FaqSection extends SectionBase {
  type: 'faq';
  title: string;
  description?: string;
  questions: string[];
}

export type HomeSection =
  | CategoryBentoSection
  | ProductRailSection
  | MaisonSection
  | EditorialSection
  | ServicesSection
  | FaqSection;

export type HomeSectionType = HomeSection['type'];

export const HOME_MAX_SECTIONS = 20;
export const BENTO_MAX_TILES = 7;
export const RAIL_MAX_LIMIT = 12;
export const RAIL_MAX_MANUAL = 12;
export const MAISON_MAX_PILLARS = 4;
export const FAQ_MAX_QUESTIONS = 10;

export const SECTION_TYPE_LABELS: Record<HomeSectionType, { label: string; hint: string }> = {
  categoryBento: { label: 'Category grid', hint: 'Bento grid of category tiles with photos' },
  productRail: { label: 'Product row', hint: 'One row of watches from a source you choose' },
  maison: { label: 'Story + pillars', hint: 'Tall photo beside a story and up to four commitments' },
  editorial: { label: 'Editorial banner', hint: 'Full-width photo with text, or photo beside text' },
  services: { label: 'Service cards', hint: 'Three cards, the middle one highlighted' },
  faq: { label: 'FAQ', hint: 'Questions picked from the FAQ page' },
};

export const RAIL_SOURCE_LABELS: Record<ProductRailSource, string> = {
  featured: 'Featured products',
  newest: 'Newest arrivals',
  bestselling: 'Best sellers',
  collection: 'A collection',
  manual: 'Hand-picked',
};

/**
 * Questions on the storefront FAQ page (apps/web/src/constants/faq.ts).
 * The storefront matches by text, so keep this list in step with that file.
 */
export const FAQ_QUESTION_OPTIONS: { group: string; questions: string[] }[] = [
  {
    group: 'Authenticity',
    questions: [
      'Are all watches authentic?',
      'Do watches come with original box and papers?',
      'How can I verify authenticity?',
    ],
  },
  {
    group: 'Shipping',
    questions: ['How long does shipping take?', 'Is shipping insured?', 'Do you ship internationally?'],
  },
  {
    group: 'Returns',
    questions: ['What is your return policy?', 'Who pays return shipping?', 'How long do refunds take?'],
  },
  {
    group: 'Warranty',
    questions: ['Do watches carry a warranty?', 'Does the warranty cover accidental damage?'],
  },
  {
    group: 'Payments',
    questions: ['What payment methods do you accept?', 'Is payment secure?', 'Do you offer EMI?'],
  },
];
