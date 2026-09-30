import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

interface HeroProps {
  tagline?: string;
  headline?: string;
  subtext?: string;
  imageUrl?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

export function Hero({
  tagline = 'LUXE Timepieces',
  headline = 'Time, Refined.',
  subtext = 'Precision crafted for those who appreciate the extraordinary.',
  imageUrl = 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=1920&q=80',
  primaryCta = { label: 'Explore Watches', href: ROUTES.shop },
  secondaryCta = { label: 'Discover Our Story', href: ROUTES.about },
}: HeroProps) {
  return (
    <section className="relative h-[88vh] min-h-[640px] w-full overflow-hidden bg-forest-900">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${imageUrl})`,
        }}
      >
        {/* Gradient overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-forest-900/95 via-forest-900/75 to-forest-900/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-center">
        <div className="mx-auto w-full max-w-[1440px] px-6 md:px-10 lg:px-16">
          <div className="max-w-2xl animate-fade-up">
            <p className="label-luxe text-cream-600">{tagline}</p>

            <h1 className="heading-luxe mt-6 text-6xl leading-[1.05] text-cream-100 md:text-7xl lg:text-8xl">
              {headline}
            </h1>

            <p className="mt-8 max-w-lg text-base leading-relaxed text-cream-200/80 md:text-lg">
              {subtext}
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href={primaryCta.href}
                className="group inline-flex items-center gap-3 bg-cream-600 px-8 py-4 text-xs font-medium uppercase tracking-[0.18em] text-forest-900 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-cream-500"
              >
                {primaryCta.label}
                <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <Link
                href={secondaryCta.href}
                className="inline-flex items-center border border-cream-100/40 px-8 py-4 text-xs font-medium uppercase tracking-[0.18em] text-cream-100 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-cream-100 hover:text-forest-900"
              >
                {secondaryCta.label}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 md:block">
        <div className="h-12 w-px bg-cream-100/30" />
      </div>
    </section>
  );
}
