import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Container } from '@/components/shared/container';

interface PageHeroProps {
  overline?: string;
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  align?: 'left' | 'center';
  variant?: 'cream' | 'forest';
}

export function PageHero({
  overline,
  title,
  subtitle,
  backHref,
  backLabel = 'Back',
  align = 'left',
  variant = 'cream',
}: PageHeroProps) {
  const isForest = variant === 'forest';

  return (
    <section
      className={`border-b ${
        isForest
          ? 'border-cream-100/10 bg-forest-900'
          : 'border-forest-900/10 bg-cream-100'
      }`}
    >
      <Container className="py-12 md:py-20">
        {backHref && (
          <Link
            href={backHref}
            className={`mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] transition-colors ${
              isForest
                ? 'text-cream-200/60 hover:text-cream-100'
                : 'text-ink-muted hover:text-forest-900'
            }`}
          >
            <ChevronLeft className="h-3 w-3" />
            {backLabel}
          </Link>
        )}

        <div
          className={
            align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'
          }
        >
          {overline && (
            <p className={`label-luxe ${isForest ? 'text-cream-600' : ''}`}>
              {overline}
            </p>
          )}

          <h1
            className={`heading-luxe mt-3 text-4xl md:text-5xl lg:text-6xl ${
              isForest ? 'text-cream-100' : ''
            }`}
          >
            {title}
          </h1>

          {subtitle && (
            <p
              className={`mt-6 text-base leading-relaxed md:text-lg ${
                isForest ? 'text-cream-200/80' : 'text-ink-soft'
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}
