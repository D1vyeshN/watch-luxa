import mongoose, { Schema, Model, Types } from 'mongoose';
import type { HomeSection } from './homepageSections';

// Admin-managed homepage content: a single document with _id 'global'
// (same pattern as settings.model.ts). Defaults reproduce the hero that used
// to be hardcoded in apps/web/src/components/home/hero.tsx.

export const HERO_MAX_SLIDES = 8;
export const HERO_HEIGHTS = ['full', 'large', 'medium'] as const;
export const HERO_MEDIA_TYPES = ['image', 'video'] as const;
export const HERO_TEXT_ALIGNS = ['left', 'center'] as const;

export interface IHeroCta {
  label: string;
  href: string;
}

// How the image sits in the hero frame: focal point (0–100 %, used as
// object-position and zoom origin) and zoom (1 = cover). The file itself is
// never cropped, so admins can re-frame at any time.
export interface IImageFrame {
  x: number;
  y: number;
  zoom: number;
}

export const HERO_MAX_ZOOM = 3;

export interface IHeroSlide {
  _id: Types.ObjectId;
  isActive: boolean;
  mediaType: (typeof HERO_MEDIA_TYPES)[number];
  imageUrl: string;        // image slides; poster for video slides
  mobileImageUrl?: string;
  imageFrame?: IImageFrame;       // desktop
  mobileImageFrame?: IImageFrame; // phones — applies to the mobile image, or the desktop image when there is none
  videoUrl?: string;       // mp4 / webm
  tagline?: string;
  headline: string;
  subtext?: string;
  primaryCta?: IHeroCta;
  secondaryCta?: IHeroCta;
  textAlign: (typeof HERO_TEXT_ALIGNS)[number];
  overlayOpacity: number;  // 0–90 (%)
}

export interface IHero {
  carouselEnabled: boolean; // off → only the first active slide renders
  autoplay: boolean;
  intervalMs: number;
  showArrows: boolean;
  showDots: boolean;
  height: (typeof HERO_HEIGHTS)[number];
  slides: IHeroSlide[];
}

export interface IHomepage {
  _id: string;
  hero: IHero;
  /** Below the hero. Unset until first saved — readers fall back to DEFAULT_HOME_SECTIONS */
  sections?: HomeSection[];
  createdAt: Date;
  updatedAt: Date;
}

export const HOMEPAGE_ID = 'global';

const CtaSchema = new Schema<IHeroCta>(
  {
    label: { type: String, required: true, trim: true, maxlength: 40 },
    href: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { _id: false }
);

const ImageFrameSchema = new Schema<IImageFrame>(
  {
    x: { type: Number, default: 50, min: 0, max: 100 },
    y: { type: Number, default: 50, min: 0, max: 100 },
    zoom: { type: Number, default: 1, min: 1, max: HERO_MAX_ZOOM },
  },
  { _id: false }
);

const HeroSlideSchema = new Schema<IHeroSlide>({
  isActive: { type: Boolean, default: true },
  mediaType: { type: String, enum: HERO_MEDIA_TYPES, default: 'image' },
  imageUrl: { type: String, required: true, trim: true },
  mobileImageUrl: { type: String, trim: true },
  imageFrame: { type: ImageFrameSchema },
  mobileImageFrame: { type: ImageFrameSchema },
  videoUrl: { type: String, trim: true },
  tagline: { type: String, trim: true, maxlength: 60 },
  headline: { type: String, required: true, trim: true, maxlength: 120 },
  subtext: { type: String, trim: true, maxlength: 300 },
  primaryCta: { type: CtaSchema },
  secondaryCta: { type: CtaSchema },
  textAlign: { type: String, enum: HERO_TEXT_ALIGNS, default: 'left' },
  overlayOpacity: { type: Number, default: 75, min: 0, max: 90 },
});

export const DEFAULT_HERO_SLIDE = {
  isActive: true,
  mediaType: 'image' as const,
  imageUrl: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=1920&q=80',
  tagline: 'LUXE Timepieces',
  headline: 'Time, Refined.',
  subtext: 'Precision crafted for those who appreciate the extraordinary.',
  primaryCta: { label: 'Explore Watches', href: '/shop' },
  secondaryCta: { label: 'Discover Our Story', href: '/about' },
  textAlign: 'left' as const,
  overlayOpacity: 75,
};

const HeroSchema = new Schema<IHero>(
  {
    carouselEnabled: { type: Boolean, default: false },
    autoplay: { type: Boolean, default: true },
    intervalMs: { type: Number, default: 6000, min: 3000, max: 15000 },
    showArrows: { type: Boolean, default: true },
    showDots: { type: Boolean, default: true },
    height: { type: String, enum: HERO_HEIGHTS, default: 'full' },
    slides: {
      type: [HeroSlideSchema],
      // _id is assigned by Mongoose when the default is cast
      default: () => [DEFAULT_HERO_SLIDE] as unknown as IHeroSlide[],
      validate: {
        validator: (v: unknown[]) => v.length <= HERO_MAX_SLIDES,
        message: `At most ${HERO_MAX_SLIDES} slides`,
      },
    },
  },
  { _id: false }
);

const HomepageSchema = new Schema<IHomepage>(
  {
    _id: { type: String, default: HOMEPAGE_ID },
    hero: { type: HeroSchema, default: () => ({}) },
    // Shape enforced by updateSectionsSchema (the only writer); see homepageSections.ts
    sections: { type: [Schema.Types.Mixed], default: undefined },
  },
  { timestamps: true }
);

export const Homepage: Model<IHomepage> = mongoose.model<IHomepage>('Homepage', HomepageSchema);
