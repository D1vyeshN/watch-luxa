import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Container } from '@/components/shared/container';
import { Section } from '@/components/shared/section';

interface Service {
  title: string;
  body: string;
  link: { label: string; href: string };
}

interface ServicesStaggerProps {
  title: string;
  description?: string;
  /** Three services; the middle one is the highlighted, offset card */
  services: [Service, Service, Service];
  /** Atmospheric photo behind the cards, washed back with cream */
  backgroundImage?: string;
}

export function ServicesStagger({
  title,
  description,
  services,
  backgroundImage,
}: ServicesStaggerProps) {
  return (
    <Section spacing="lg" background="cream" className="relative overflow-hidden md:pb-40">
      {backgroundImage && (
        <>
          <Image
            src={backgroundImage}
            alt=""
            fill
            sizes="100vw"
            className="object-cover grayscale-[35%]"
          />
          {/* Heavy cream wash: the photo sets the mood, the cards stay the subject */}
          <div className="absolute inset-0 bg-gradient-to-b from-cream-200/95 via-cream-200/80 to-cream-200/90" />
        </>
      )}

      <Container className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="heading-luxe text-3xl md:text-4xl lg:text-5xl">{title}</h2>
          {description && (
            <p className="mt-4 text-base text-ink-soft md:text-lg">{description}</p>
          )}
        </div>

        <ul className="mx-auto mt-12 grid max-w-5xl gap-4 md:mt-16 md:grid-cols-3 md:gap-6">
          {services.map((s, i) => {
            const featured = i === 1;
            return (
              <li
                key={s.title}
                className={cn(
                  'flex flex-col p-8 md:p-10',
                  featured
                    ? 'bg-forest-900 text-cream-100 md:translate-y-16'
                    : 'border border-forest-900/10 bg-cream-50'
                )}
              >
                <h3
                  className={cn(
                    'font-serif text-2xl leading-snug md:text-3xl',
                    featured ? 'text-cream-100' : 'text-forest-900'
                  )}
                >
                  {s.title}
                </h3>
                <p
                  className={cn(
                    'mt-4 flex-1 text-sm leading-relaxed md:text-base',
                    featured ? 'text-cream-200/80' : 'text-ink-soft'
                  )}
                >
                  {s.body}
                </p>
                <Link
                  href={s.link.href}
                  className={cn(
                    'mt-8 self-start border-b py-1 text-xs uppercase tracking-[0.18em] transition-colors',
                    featured
                      ? 'border-cream-600 text-cream-600 hover:border-cream-400 hover:text-cream-400'
                      : 'border-forest-900 text-forest-900 hover:border-cream-700 hover:text-cream-700'
                  )}
                >
                  {s.link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
