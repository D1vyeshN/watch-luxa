import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Container } from '@/components/shared/container';
import { Section } from '@/components/shared/section';

interface EditorialBannerProps {
  headline: string;
  body: string;
  imageUrl: string;
  /** Describe the photo; leave empty when it's purely atmospheric */
  imageAlt?: string;
  cta?: { label: string; href: string };
  /** split: image beside text. immersive: full-bleed image with text over it */
  variant?: 'split' | 'immersive';
  reverse?: boolean;
  background?: 'default' | 'cream';
}

export function EditorialBanner({
  headline,
  body,
  imageUrl,
  imageAlt = '',
  cta,
  variant = 'split',
  reverse = false,
  background = 'cream',
}: EditorialBannerProps) {
  if (variant === 'immersive') {
    return (
      <section className="relative flex min-h-[560px] items-end overflow-hidden bg-forest-900 md:min-h-[80vh]">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="100vw"
          className="object-cover"
        />
        {/* forest-900 scrim, heaviest behind the text */}
        <div className="absolute inset-0 bg-gradient-to-t from-forest-900/90 via-forest-900/40 to-forest-900/0" />

        <Container className="relative py-16 md:py-24">
          <div className="max-w-xl">
            <h2 className="heading-luxe text-4xl leading-tight text-cream-100! md:text-5xl lg:text-6xl">
              {headline}
            </h2>
            <p className="mt-6 text-base leading-relaxed text-cream-200/85 md:text-lg">{body}</p>
            {cta && (
              <Link
                href={cta.href}
                className="mt-8 inline-flex items-center border border-cream-100/50 px-8 py-4 text-xs font-medium uppercase tracking-[0.18em] text-cream-100 transition-colors duration-300 hover:bg-cream-100 hover:text-forest-900"
              >
                {cta.label}
              </Link>
            )}
          </div>
        </Container>
      </section>
    );
  }

  return (
    <Section spacing="lg" background={background}>
      <Container>
        <div className="grid items-center gap-10 md:gap-16 lg:grid-cols-2">
          <div
            className={cn(
              'relative aspect-[4/5] overflow-hidden bg-cream-200 lg:aspect-square',
              reverse && 'lg:order-2'
            )}
          >
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="max-w-lg">
            <h2 className="heading-luxe text-4xl leading-tight md:text-5xl lg:text-6xl">
              {headline}
            </h2>

            <p className="mt-6 text-base leading-relaxed text-ink-soft md:text-lg">{body}</p>

            {cta && (
              <Link
                href={cta.href}
                className="mt-8 inline-flex items-center border-b border-forest-900 py-1 text-xs uppercase tracking-[0.18em] text-forest-900 transition-colors hover:border-cream-700 hover:text-cream-700"
              >
                {cta.label}
              </Link>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
