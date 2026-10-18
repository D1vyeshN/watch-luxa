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
  updatedAt: string;
}

export const HERO_MAX_SLIDES = 8;
