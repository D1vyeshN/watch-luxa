'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HeroConfig } from '@/types/home';
import { HeroSlideView } from './hero-slide';

const SWIPE_THRESHOLD_PX = 50;

interface HeroCarouselProps {
  config: HeroConfig;
  heightClass: string;
}

export function HeroCarousel({ config, heightClass }: HeroCarouselProps) {
  const { slides, intervalMs, showArrows, showDots } = config;
  const count = slides.length;

  const [index, setIndex] = useState(0);
  // Visitor pressed pause (WCAG 2.2.2) vs. temporarily paused by hover/focus
  const [stopped, setStopped] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pageHidden, setPageHidden] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const go = useCallback((to: number) => setIndex(((to % count) + count) % count), [count]);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(query.matches);
    const updateVisibility = () => setPageHidden(document.hidden);
    updateMotion();
    query.addEventListener('change', updateMotion);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => {
      query.removeEventListener('change', updateMotion);
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, []);

  const canAutoplay = config.autoplay && !reducedMotion;
  const playing = canAutoplay && !stopped && !hovering && !focused && !pageHidden;

  // Restarts on every slide change, so manual navigation gets a full interval
  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => go(index + 1), intervalMs);
    return () => clearTimeout(timer);
  }, [playing, index, intervalMs, go]);

  return (
    <section
      data-hero
      className={cn('relative w-full overflow-hidden bg-forest-900', heightClass)}
      aria-roledescription="carousel"
      aria-label="Featured"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') go(index - 1);
        else if (e.key === 'ArrowRight') go(index + 1);
      }}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(dx) > SWIPE_THRESHOLD_PX) go(dx < 0 ? index + 1 : index - 1);
      }}
    >
      {/* Slides — stacked and cross-faded */}
      <div aria-live={playing ? 'off' : 'polite'}>
        {slides.map((slide, i) => {
          const active = i === index;
          return (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={!active}
              inert={!active}
              className={cn(
                'absolute inset-0 transition-opacity duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
                active ? 'z-[1] opacity-100' : 'z-0 opacity-0'
              )}
            >
              <HeroSlideView slide={slide} isFirst={i === 0} active={active} />
            </div>
          );
        })}
      </div>

      {/* Arrows */}
      {showArrows && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            className="absolute left-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center border border-cream-100/30 text-cream-100 transition-colors duration-300 hover:bg-cream-100 hover:text-forest-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-600 md:flex"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            className="absolute right-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center border border-cream-100/30 text-cream-100 transition-colors duration-300 hover:bg-cream-100 hover:text-forest-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-600 md:flex"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dots + pause */}
      {(showDots || canAutoplay) && (
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3">
          {canAutoplay && (
            <button
              type="button"
              onClick={() => setStopped((s) => !s)}
              className="flex h-8 w-8 items-center justify-center text-cream-100/70 transition-colors hover:text-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-600"
              aria-label={stopped ? 'Play slideshow' : 'Pause slideshow'}
            >
              {stopped ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            </button>
          )}
          {showDots &&
            slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => go(i)}
                className="group flex h-8 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-600"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
              >
                <span
                  className={cn(
                    'block h-px transition-[width,background-color] duration-500',
                    i === index ? 'w-10 bg-cream-100' : 'w-5 bg-cream-100/40 group-hover:bg-cream-100/70'
                  )}
                />
              </button>
            ))}
        </div>
      )}
    </section>
  );
}
