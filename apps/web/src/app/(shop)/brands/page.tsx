import Link from 'next/link';
import type { Metadata } from 'next';
import { Container } from '@/components/shared/container';
import { EmptyState } from '@/components/shared/empty-state';
import { ListingHeader } from '@/components/shop';
import { serverFetch } from '@/lib/api/server-fetch';
import { buildStaticPageMetadata } from '@/lib/seo/metadata';
import { ROUTES } from '@/constants/routes';
import type { ApiResponse } from '@/types/api';
import type { Brand } from '@/types/catalog';

export const revalidate = 300;

export const metadata: Metadata = buildStaticPageMetadata(
  'Brands',
  'The watch houses represented at LUXE, from Geneva to Tokyo.',
  ROUTES.brands
);

async function getBrands(): Promise<Brand[]> {
  const response = await serverFetch<ApiResponse<Brand[]>>('/brands', {
    revalidate: 300,
    tags: ['brands'],
  });
  return response?.data ?? [];
}

/** "Switzerland, since 1905" — whichever parts the brand has */
function brandProvenance(brand: Pick<Brand, 'country' | 'founded'>) {
  return [brand.country, brand.founded && `since ${brand.founded}`].filter(Boolean).join(', ');
}

export default async function BrandsPage() {
  const brands = [...(await getBrands())].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <ListingHeader
        title="Brands"
        description="The houses we carry, each chosen for the way it builds a watch."
      />

      <Container className="py-10 md:py-16">
        {brands.length === 0 ? (
          <EmptyState
            title="Our brand list is being updated"
            description="In the meantime, the full catalogue is a click away."
            action={{ label: 'Browse all watches', href: ROUTES.shop }}
          />
        ) : (
          // Typographic index: the names are the design
          <ul className="grid border-t border-forest-900/15 md:grid-cols-2 md:gap-x-16">
            {brands.map((brand) => (
              <li key={brand.id} className="border-b border-forest-900/15">
                <Link
                  href={ROUTES.brand(brand.slug)}
                  className="group flex items-baseline justify-between gap-6 py-6 md:py-8"
                >
                  <span className="font-serif text-3xl leading-tight text-forest-900 underline-offset-[6px] decoration-1 group-hover:underline md:text-4xl">
                    {brand.name}
                  </span>
                  <span className="shrink-0 text-right text-sm text-ink-soft">
                    {brandProvenance(brand)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}
