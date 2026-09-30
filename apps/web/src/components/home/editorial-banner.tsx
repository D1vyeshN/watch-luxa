import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/shared/container';
import { Section } from '@/components/shared/section';

interface EditorialBannerProps {
  overline?: string;
  headline: string;
  body: string;
  imageUrl: string;
  cta?: { label: string; href: string };
  reverse?: boolean;
}

export function EditorialBanner({
  overline = 'The Standard',
  headline,
  body,
  imageUrl,
  cta,
  reverse = false,
}: EditorialBannerProps) {
  return (
    <Section spacing="lg" background="cream">
      <Container>
        <div
          className={`grid items-center gap-10 md:gap-16 lg:grid-cols-2 ${
            reverse ? 'lg:[&>*:first-child]:order-2' : ''
          }`}
        >
          {/* Image */}
          <div className="relative aspect-[4/5] overflow-hidden bg-cream-200 lg:aspect-square">
            <Image
              src={imageUrl}
              alt={headline}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/* Text */}
          <div className="max-w-lg">
            <p className="label-luxe">{overline}</p>

            <h2 className="heading-luxe mt-4 text-4xl leading-tight md:text-5xl lg:text-6xl">
              {headline}
            </h2>

            <p className="mt-6 text-base leading-relaxed text-ink-soft md:text-lg">
              {body}
            </p>

            {cta && (
              <Link
                href={cta.href}
                className="mt-8 inline-flex items-center justify-center border-b border-forest-900 pb-1 text-xs uppercase tracking-[0.18em] text-forest-900 transition-colors hover:border-cream-700 hover:text-cream-700"
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
