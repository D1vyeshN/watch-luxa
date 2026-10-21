import type { Metadata } from 'next';
import { Container } from '@/components/shared/container';
import { EmptyState } from '@/components/shared/empty-state';
import { CollectionCard, ListingHeader } from '@/components/shop';
import { serverFetch } from '@/lib/api/server-fetch';
import { buildStaticPageMetadata } from '@/lib/seo/metadata';
import { ROUTES } from '@/constants/routes';
import type { ApiResponse } from '@/types/api';
import type { Collection } from '@/types/catalog';

export const revalidate = 300;

export const metadata: Metadata = buildStaticPageMetadata(
  'Collections',
  'Curated edits of LUXE timepieces, from heritage classics to limited editions.',
  ROUTES.collections
);

async function getCollections(): Promise<Collection[]> {
  const response = await serverFetch<ApiResponse<Collection[]>>('/collections', {
    revalidate: 300,
    tags: ['collections'],
  });
  return response?.data ?? [];
}

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <>
      <ListingHeader
        title="Collections"
        description="Edits chosen by our watchmakers, each built around a single idea."
      />

      <Container className="py-10 md:py-14">
        {collections.length === 0 ? (
          <EmptyState
            title="Collections are being curated"
            description="In the meantime, the full catalogue is a click away."
            action={{ label: 'Browse all watches', href: ROUTES.shop }}
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((c, i) => (
              <li key={c.id}>
                <CollectionCard collection={c} priority={i < 3} />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}
