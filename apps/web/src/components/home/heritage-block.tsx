import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/shared/container';

interface HeritageBlockProps {
  headline?: string;
  body?: string;
  cta?: { label: string; href: string };
  imageUrl?: string;
}

export function HeritageBlock({
  headline = 'Crafted Beyond Time',
  body = 'Every LUXE timepiece is a testament to centuries of horological mastery. From the intricate movement to the hand-finished case, each detail is considered, each component a promise.',
  cta = { label: 'Explore the Maison', href: '/about' },
  imageUrl = 'https://images.unsplash.com/photo-1594534475808-b18fc33b045e?w=1200&q=80',
}: HeritageBlockProps) {
  return (
    <section className="relative bg-forest-900 text-cream-100">
      <div className="grid md:grid-cols-2">
        {/* Image half */}
        <div className="relative aspect-square md:aspect-auto md:min-h-[600px]">
          <Image
            src={imageUrl}
            alt={headline}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        {/* Content half */}
        <div className="flex items-center">
          <Container className="py-16 md:py-24">
            <div className="max-w-md">
              <p className="label-luxe text-cream-600">The Craft</p>

              <h2 className="heading-luxe mt-4 text-4xl leading-tight text-cream-100 md:text-5xl lg:text-6xl">
                {headline}
              </h2>

              <p className="mt-6 text-base leading-relaxed text-cream-200/80">
                {body}
              </p>

              <Link
                href={cta.href}
                className="mt-8 inline-flex items-center justify-center border-b border-cream-600 pb-1 text-xs uppercase tracking-[0.18em] text-cream-600 transition-colors hover:border-cream-400 hover:text-cream-400"
              >
                {cta.label}
              </Link>
            </div>
          </Container>
        </div>
      </div>
    </section>
  );
}
