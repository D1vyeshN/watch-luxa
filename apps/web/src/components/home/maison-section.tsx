import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/shared/container';
import { Section } from '@/components/shared/section';

interface Pillar {
  title: string;
  body: string;
}

interface MaisonSectionProps {
  headline: string;
  body: string;
  imageUrl: string;
  imageAlt?: string;
  pillars: Pillar[];
  cta: { label: string; href: string };
  background?: 'default' | 'cream';
}

// Story beside a tall photo, with the house's commitments underneath —
// the "about" moment of the page.
export function MaisonSection({
  headline,
  body,
  imageUrl,
  imageAlt = '',
  pillars,
  cta,
  background = 'default',
}: MaisonSectionProps) {
  return (
    <Section spacing="lg" background={background}>
      <Container>
        <div className="grid gap-10 md:gap-16 lg:grid-cols-12 lg:items-center">
          <div className="relative aspect-[4/5] overflow-hidden bg-cream-200 lg:col-span-5">
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <h2 className="heading-luxe text-4xl leading-tight md:text-5xl lg:text-6xl">
              {headline}
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-soft md:text-lg">
              {body}
            </p>

            <dl className="mt-12 grid gap-8 border-t border-forest-900/15 pt-8 sm:grid-cols-3 sm:gap-6">
              {pillars.map((p) => (
                <div key={p.title}>
                  <dt className="font-serif text-xl leading-snug text-forest-900">{p.title}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-ink-soft">{p.body}</dd>
                </div>
              ))}
            </dl>

            <Link
              href={cta.href}
              className="mt-10 inline-flex items-center border-b border-forest-900 py-1 text-xs uppercase tracking-[0.18em] text-forest-900 transition-colors hover:border-cream-700 hover:text-cream-700"
            >
              {cta.label}
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  );
}
