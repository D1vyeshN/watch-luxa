import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ListingHeader, ProductListing } from '@/components/shop';
import { JsonLd, buildBreadcrumbJsonLd } from '@/components/seo/json-ld';
import { serverFetch } from '@/lib/api/server-fetch';
import { buildStaticPageMetadata } from '@/lib/seo/metadata';
import { ROUTES } from '@/constants/routes';
import { env } from '@/config/env';
import type { ApiResponse } from '@/types/api';
import type { Brand } from '@/types/catalog';

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getBrand(slug: string): Promise<Brand | null> {
  const response = await serverFetch<ApiResponse<Brand>>(`/brands/${slug}`, {
    revalidate: 300,
    tags: ['brands', `brand-${slug}`],
  });
  return response?.data ?? null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) return { title: 'Brand not found' };

  return buildStaticPageMetadata(
    `${brand.name} Watches`,
    brand.heritageStory?.slice(0, 160) ?? `${brand.name} timepieces at LUXE, each authenticated in-house.`,
    ROUTES.brand(brand.slug)
  );
}

export default async function BrandPage({ params }: PageProps) {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) notFound();

  const site = env.NEXT_PUBLIC_SITE_URL;
  const facts = [brand.country, brand.founded && `Founded ${brand.founded}`].filter(
    (f): f is string => Boolean(f)
  );

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: 'Brands', url: `${site}${ROUTES.brands}` },
          { name: brand.name, url: `${site}${ROUTES.brand(brand.slug)}` },
        ])}
      />

      <ListingHeader
        title={brand.name}
        description={brand.heritageStory}
        facts={facts}
        breadcrumbs={[{ label: 'Brands', href: ROUTES.brands }, { label: brand.name }]}
      />

      <ProductListing
        fixedFilters={{ brandSlug: brand.slug }}
        empty={{
          title: `No ${brand.name} pieces in stock right now`,
          description: 'New pieces arrive regularly. Explore the other houses in the meantime.',
          action: { label: 'All brands', href: ROUTES.brands },
        }}
      />
    </>
  );
}
