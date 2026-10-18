import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import type { HeroConfig, HeroSlide } from '@/types/home';
import { HeroSlideView } from './hero-slide';
import { HeroCarousel } from './hero-carousel';

// Shown when the API has no hero (e.g. older API) — matches the admin defaults
const FALLBACK_SLIDE: HeroSlide = {
  id: 'default',
  mediaType: 'image',
  imageUrl: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=1920&q=80',
  tagline: 'LUXE Timepieces',
  headline: 'Time, Refined.',
  subtext: 'Precision crafted for those who appreciate the extraordinary.',
  primaryCta: { label: 'Explore Watches', href: ROUTES.shop },
  secondaryCta: { label: 'Discover Our Story', href: ROUTES.about },
  textAlign: 'left',
  overlayOpacity: 75,
};

const HEIGHTS: Record<HeroConfig['height'], string> = {
  full: 'h-svh', // exactly the visible screen — the homepage navbar floats over it
  large: 'h-[72vh] min-h-[560px]',
  medium: 'h-[60vh] min-h-[480px]',
};

interface HeroProps {
  /** Managed in admin → Homepage */
  config?: HeroConfig;
}

export function Hero({ config }: HeroProps) {
  const slides = config?.slides.length ? config.slides : [FALLBACK_SLIDE];
  const heightClass = HEIGHTS[config?.height ?? 'full'];

  if (config?.carouselEnabled && slides.length > 1) {
    return <HeroCarousel config={{ ...config, slides }} heightClass={heightClass} />;
  }

  // Carousel off: the first active slide only
  return (
    <section data-hero className={cn('relative w-full overflow-hidden bg-forest-900', heightClass)}>
      <HeroSlideView slide={slides[0]} isFirst />

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 md:block">
        <div className="h-12 w-px bg-cream-100/30" />
      </div>
    </section>
  );
}
