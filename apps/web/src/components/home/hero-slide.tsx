import Link from 'next/link';
import { getImageProps } from 'next/image';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HeroImageFrame, HeroSlide } from '@/types/home';
import { HeroVideo } from './hero-video';

// Hosts allowed by images.remotePatterns in next.config.ts; anything else an
// admin points at is served as-is instead of crashing the optimizer.
function isOptimizable(src: string) {
  try {
    const { protocol, hostname, pathname } = new URL(src);
    if (protocol !== 'https:') return false;
    return (
      (hostname.endsWith('.supabase.co') && pathname.startsWith('/storage/v1/object/public/')) ||
      hostname === 'images.unsplash.com' ||
      hostname === 'picsum.photos'
    );
  } catch {
    return false;
  }
}

const CENTER: HeroImageFrame = { x: 50, y: 50, zoom: 1 };

// Admin framing → CSS variables, switched at md (768px) like the <picture>
// sources below. Same maths as the admin editor (image-framer.tsx).
const FRAME_CLASSES =
  '[object-position:var(--hero-pos-m)] md:[object-position:var(--hero-pos-d)] ' +
  '[transform-origin:var(--hero-pos-m)] md:[transform-origin:var(--hero-pos-d)] ' +
  '[scale:var(--hero-zoom-m)] md:[scale:var(--hero-zoom-d)]';

function frameVars(slide: HeroSlide) {
  const d = slide.imageFrame ?? CENTER;
  const m = slide.mobileImageFrame ?? CENTER;
  return {
    '--hero-pos-d': `${d.x}% ${d.y}%`,
    '--hero-zoom-d': d.zoom,
    '--hero-pos-m': `${m.x}% ${m.y}%`,
    '--hero-zoom-m': m.zoom,
  } as React.CSSProperties;
}

// Desktop image with an optional portrait crop for phones (art direction —
// see next/image docs). Only the first slide is fetched eagerly: it's the LCP.
function HeroImage({ slide, eager }: { slide: HeroSlide; eager: boolean }) {
  const common = {
    alt: '',
    sizes: '100vw',
    ...(eager ? { loading: 'eager' as const, fetchPriority: 'high' as const } : {}),
  };
  const { props: desktopProps } = getImageProps({
    ...common,
    src: slide.imageUrl,
    width: 1920,
    height: 1080,
    unoptimized: !isOptimizable(slide.imageUrl),
  });

  if (!slide.mobileImageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- props from getImageProps
      <img
        {...desktopProps}
        className={cn('absolute inset-0 h-full w-full object-cover', FRAME_CLASSES)}
        style={frameVars(slide)}
      />
    );
  }

  const {
    props: { srcSet: mobileSrcSet, ...mobileProps },
  } = getImageProps({
    ...common,
    src: slide.mobileImageUrl,
    width: 828,
    height: 1472,
    unoptimized: !isOptimizable(slide.mobileImageUrl),
  });

  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={desktopProps.srcSet ?? desktopProps.src} />
      <source media="(max-width: 767px)" srcSet={mobileSrcSet ?? mobileProps.src} />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- props from getImageProps */}
      <img
        {...mobileProps}
        className={cn('absolute inset-0 h-full w-full object-cover', FRAME_CLASSES)}
        style={frameVars(slide)}
      />
    </picture>
  );
}

// Same values as the original hardcoded hero at overlayOpacity 75:
// forest-900 at 95% → 75% → 30% from left to right
function overlayStyle(slide: HeroSlide) {
  const a = slide.overlayOpacity / 100;
  const color = (alpha: number) => `rgb(15 35 32 / ${alpha.toFixed(2)})`; // forest-900
  return {
    background:
      slide.textAlign === 'center'
        ? color(a)
        : `linear-gradient(to right, ${color(Math.min(a + 0.2, 0.95))}, ${color(a)}, ${color(a * 0.4)})`,
  };
}

interface HeroSlideViewProps {
  slide: HeroSlide;
  /** First slide: eager image + the page's <h1> */
  isFirst: boolean;
  /** Carousel: only the visible slide plays video / animates text */
  active?: boolean;
}

export function HeroSlideView({ slide, isFirst, active = true }: HeroSlideViewProps) {
  const Heading = isFirst ? 'h1' : 'h2';
  const centered = slide.textAlign === 'center';

  return (
    <>
      {/* Background */}
      <div className="absolute inset-0">
        <HeroImage slide={slide} eager={isFirst} />
        {slide.mediaType === 'video' && slide.videoUrl && (
          <HeroVideo src={slide.videoUrl} active={active} />
        )}
        {/* Overlay for text legibility */}
        <div className="absolute inset-0" style={overlayStyle(slide)} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-center pt-20">
        <div className="mx-auto w-full max-w-[1440px] px-6 md:px-10 lg:px-16">
          <div
            className={cn(
              'max-w-2xl',
              active && 'animate-fade-up',
              centered && 'mx-auto text-center'
            )}
          >
            {slide.tagline && <p className="label-luxe text-cream-600!">{slide.tagline}</p>}

            <Heading
              className={cn(
                // ! — .heading-luxe / .label-luxe set color in the same layer, declared later
                'heading-luxe text-[clamp(3rem,9vw,6rem)] leading-[1.05] text-cream-100!',
                slide.tagline && 'mt-6'
              )}
            >
              {slide.headline}
            </Heading>

            {slide.subtext && (
              <p
                className={cn(
                  'mt-8 max-w-lg text-base leading-relaxed text-cream-200/80 md:text-lg',
                  centered && 'mx-auto'
                )}
              >
                {slide.subtext}
              </p>
            )}

            {(slide.primaryCta || slide.secondaryCta) && (
              <div className={cn('mt-10 flex flex-wrap gap-4', centered && 'justify-center')}>
                {slide.primaryCta && (
                  <Link
                    href={slide.primaryCta.href}
                    className="group inline-flex items-center gap-3 bg-cream-600 px-8 py-4 text-xs font-medium uppercase tracking-[0.18em] text-forest-900 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-cream-500"
                  >
                    {slide.primaryCta.label}
                    <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                )}

                {slide.secondaryCta && (
                  <Link
                    href={slide.secondaryCta.href}
                    className="inline-flex items-center border border-cream-100/40 px-8 py-4 text-xs font-medium uppercase tracking-[0.18em] text-cream-100 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-cream-100 hover:text-forest-900"
                  >
                    {slide.secondaryCta.label}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
