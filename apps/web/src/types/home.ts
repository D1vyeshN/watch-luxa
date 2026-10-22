import type { Product, Brand, Category, Collection } from './catalog';

// ─── Homepage hero — managed in admin → Homepage ───
// Mirrors toStorefrontHero() in apps/api/src/services/homepage.service.ts
export interface HeroCta {
  label: string;
  href: string;
}

// Focal point (0–100 %) + zoom (1 = cover), set in admin → Homepage → Framing
export interface HeroImageFrame {
  x: number;
  y: number;
  zoom: number;
}

export interface HeroSlide {
  id: string;
  mediaType: 'image' | 'video';
  imageUrl: string;        // image slides; poster for video slides
  mobileImageUrl?: string;
  imageFrame?: HeroImageFrame;       // desktop
  mobileImageFrame?: HeroImageFrame; // phones — mobile image, or desktop image when none
  videoUrl?: string;
  tagline?: string;
  headline: string;
  subtext?: string;
  primaryCta?: HeroCta;
  secondaryCta?: HeroCta;
  textAlign: 'left' | 'center';
  overlayOpacity: number;  // 0–90 (%)
}

export interface HeroConfig {
  carouselEnabled: boolean;
  autoplay: boolean;
  intervalMs: number;
  showArrows: boolean;
  showDots: boolean;
  height: 'full' | 'large' | 'medium';
  slides: HeroSlide[];     // active slides only, in display order
}

// ─── Homepage sections (below the hero) — managed in admin → Homepage ───
// Mirrors the Homepage model's `sections` in apps/api. Each section renders one
// component; order is array order. Any type may appear more than once.

export interface HomeLink {
  label: string;
  href: string;
}

interface SectionBase {
  id: string;
  /** Hidden sections stay in admin but don't render */
  enabled: boolean;
}

export interface CategoryBentoSection extends SectionBase {
  type: 'categoryBento';
  title: string;
  description?: string;
  /** Tile order; the first is the large tile. Empty = first categories by display order */
  tiles: { categorySlug: string; imageUrl?: string }[];
}

export type ProductRailSource = 'featured' | 'newest' | 'bestselling' | 'collection' | 'manual';

export interface ProductRailSection extends SectionBase {
  type: 'productRail';
  title: string;
  description?: string;
  source: ProductRailSource;
  collectionId?: string; // source: collection
  productIds?: string[]; // source: manual, in display order
  limit: number;
  viewAll?: HomeLink;
  /** Filled in by the API (/home); absent in the static defaults */
  products?: Product[];
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
  /** split only: image on the right */
  reverse?: boolean;
  cta?: HomeLink;
}

export interface ServicesSection extends SectionBase {
  type: 'services';
  title: string;
  description?: string;
  backgroundImage?: string;
  /** Exactly three; the middle one is the highlighted, offset card */
  services: [ServiceCard, ServiceCard, ServiceCard];
}

export interface ServiceCard {
  title: string;
  body: string;
  link: HomeLink;
}

export interface FaqSection extends SectionBase {
  type: 'faq';
  title: string;
  description?: string;
  /** Questions picked from the FAQ page (matched by question text), in order */
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

export interface HomeData {
  hero?: HeroConfig;
  /** Absent until the API serves sections; the storefront then uses its defaults */
  sections?: HomeSection[];
  featured: Product[];
  newArrivals: Product[];
  trending: Product[];
  categories: Category[];
  brands: Brand[];
  collections: Collection[];
}
