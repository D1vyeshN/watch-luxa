import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/shared/container';
import { Section } from '@/components/shared/section';
import { ROUTES } from '@/constants/routes';
import type { Category } from '@/types/catalog';

interface CategoryStripProps {
  categories: Category[];
}

export function CategoryStrip({ categories }: CategoryStripProps) {
  if (categories.length === 0) return null;

  return (
    <Section spacing="md" background="default">
      <Container>
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="label-luxe">Browse by category</p>
            <h2 className="heading-luxe mt-2 text-3xl md:text-4xl">
              Find your timepiece
            </h2>
          </div>
          <Link
            href={ROUTES.shop}
            className="hidden text-xs uppercase tracking-[0.18em] text-forest-900 underline-offset-4 hover:underline md:block"
          >
            View all
          </Link>
        </div>

        {/* Scroll on mobile, grid on desktop */}
        <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible lg:grid-cols-8">
          {categories.slice(0, 8).map((cat) => (
            <Link
              key={cat.id}
              href={ROUTES.category(cat.slug)}
              className="group flex min-w-[120px] flex-col items-center gap-3 text-center md:min-w-0"
            >
              <div className="relative h-20 w-20 overflow-hidden rounded-full border border-forest-900/10 bg-cream-200 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:border-cream-600 group-hover:shadow-lg">
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="80px"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="font-serif text-2xl text-forest-900">
                      {cat.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              <span className="text-[10px] uppercase leading-tight tracking-[0.14em] text-forest-900 transition-colors group-hover:text-forest-700">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}
