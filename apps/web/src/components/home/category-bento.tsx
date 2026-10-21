import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Container } from '@/components/shared/container';
import { Section } from '@/components/shared/section';
import { ROUTES } from '@/constants/routes';
import { BENTO_CATEGORY_SLUGS, CATEGORY_ART } from '@/constants/home-art';
import type { Category } from '@/types/catalog';
import { SectionHeader } from './section-header';

const TILE_COUNT = 7;

// Tile footprints by position. Desktop is a 4×3 grid, phones a 2-column grid:
//   ┌───────┬───┬───┐     ┌───────┐
//   │   0   │ 1 │ 2 │     │   0   │
//   │       ├───┴───┤     ├───┬───┤
//   │       │   3   │     │ 1 │ 2 │
//   ├───┬───┼───┬───┤     ├───┴───┤
//   │ 4 │ 5 │ 6 │all│     │   3   │ …
//   └───┴───┴───┴───┘     └───────┘
const FOOTPRINTS = [
  'col-span-2 md:row-span-2',
  '',
  '',
  'col-span-2',
  '',
  '',
  '',
];

const SIZES = [
  '(max-width: 768px) 100vw, 50vw',
  '(max-width: 768px) 50vw, 25vw',
  '(max-width: 768px) 50vw, 25vw',
  '(max-width: 768px) 100vw, 50vw',
  '(max-width: 768px) 50vw, 25vw',
  '(max-width: 768px) 50vw, 25vw',
  '(max-width: 768px) 50vw, 25vw',
];

/** Preferred categories first, then any others, so the grid stays full */
function pickCategories(categories: Category[]) {
  const preferred = BENTO_CATEGORY_SLUGS.map((slug) =>
    categories.find((c) => c.slug === slug)
  ).filter((c): c is Category => Boolean(c));
  const rest = categories.filter((c) => !preferred.includes(c));
  return [...preferred, ...rest].slice(0, TILE_COUNT);
}

interface CategoryBentoProps {
  categories: Category[];
  title?: string;
  description?: string;
}

export function CategoryBento({
  categories,
  title = 'Explore the Collection',
  description = 'From slim dress pieces to tool watches built for depth and altitude.',
}: CategoryBentoProps) {
  const tiles = pickCategories(categories);
  if (tiles.length === 0) return null;

  return (
    <Section spacing="lg" background="default">
      <Container>
        <SectionHeader title={title} description={description} />

        <ul className="grid auto-rows-[46vw] grid-cols-2 gap-2 md:auto-rows-[clamp(200px,21vw,300px)] md:grid-cols-4 md:gap-3">
          {tiles.map((cat, i) => {
            const art = CATEGORY_ART[cat.slug] ?? cat.image;
            const large = i === 0;
            return (
              <li key={cat.id} className={cn('relative', FOOTPRINTS[i])}>
                <Link
                  href={ROUTES.category(cat.slug)}
                  className="group relative flex h-full overflow-hidden bg-forest-800"
                >
                  {art && (
                    <Image
                      src={art}
                      alt=""
                      fill
                      sizes={SIZES[i]}
                      className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                    />
                  )}
                  {/* Scrim keeps the label legible on any photo */}
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-900/75 via-forest-900/10 to-transparent" />

                  <span
                    className={cn(
                      'relative mt-auto p-4 font-serif leading-tight text-cream-100 underline-offset-[6px] decoration-1 group-hover:underline md:p-6',
                      large ? 'text-3xl md:text-5xl' : 'text-xl md:text-2xl'
                    )}
                  >
                    {cat.name}
                  </span>
                </Link>
              </li>
            );
          })}

          {/* Closing tile: the route to everything not shown */}
          <li className={cn(tiles.length % 2 === 0 && 'col-span-2 md:col-span-1')}>
            <Link
              href={ROUTES.shop}
              className="group flex h-full flex-col justify-between bg-forest-900 p-4 text-cream-100 transition-colors hover:bg-forest-800 md:p-6"
            >
              <span className="text-sm text-cream-200/70">Every category</span>
              <span className="font-serif text-2xl leading-tight underline-offset-[6px] decoration-1 group-hover:underline md:text-3xl">
                Browse all watches
              </span>
            </Link>
          </li>
        </ul>
      </Container>
    </Section>
  );
}
