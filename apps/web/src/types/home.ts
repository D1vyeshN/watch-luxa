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

export interface HomeData {
  hero?: HeroConfig;
  featured: Product[];
  newArrivals: Product[];
  trending: Product[];
  categories: Category[];
  brands: Brand[];
  collections: Collection[];
}
