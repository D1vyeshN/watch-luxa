import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ListingHeader, ProductListing } from '@/components/shop';
import { JsonLd, buildBreadcrumbJsonLd } from '@/components/seo/json-ld';
import { serverFetch } from '@/lib/api/server-fetch';
import { buildStaticPageMetadata } from '@/lib/seo/metadata';
import { ROUTES } from '@/constants/routes';
import { env } from '@/config/env';
import type { ApiResponse } from '@/types/api';
import type { Collection } from '@/types/catalog';

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getCollection(slug: string): Promise<Collection | null> {
  const response = await serverFetch<ApiResponse<Collection>>(`/collections/${slug}`, {
    revalidate: 300,
    tags: ['collections', `collection-${slug}`],
  });
  return response?.data ?? null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollection(slug);
  if (!collection) return { title: 'Collection not found' };

  const meta = buildStaticPageMetadata(
    collection.name,
    collection.description ?? `The ${collection.name} collection at LUXE.`,
    ROUTES.collection(collection.slug)
  );
  return collection.image
    ? { ...meta, openGraph: { ...meta.openGraph, images: [{ url: collection.image }] } }
    : meta;
}

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params;
  const collection = await getCollection(slug);
  if (!collection) notFound();

  const site = env.NEXT_PUBLIC_SITE_URL;

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: 'Collections', url: `${site}${ROUTES.collections}` },
          { name: collection.name, url: `${site}${ROUTES.collection(collection.slug)}` },
        ])}
      />

      <ListingHeader
        title={collection.name}
        description={collection.description}
        imageUrl={collection.image}
        breadcrumbs={[
          { label: 'Collections', href: ROUTES.collections },
          { label: collection.name },
        ]}
      />

      <ProductListing
        fixedFilters={{ collectionId: collection.id }}
        empty={{
          title: 'This collection is being curated',
          description: 'Pieces will appear here soon. Explore the full catalogue in the meantime.',
          action: { label: 'Browse all watches', href: ROUTES.shop },
        }}
      />
    </>
  );
}
