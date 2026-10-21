import type { Metadata } from 'next';
import { ListingHeader, ProductListing } from '@/components/shop';
import { buildStaticPageMetadata } from '@/lib/seo/metadata';
import { ROUTES } from '@/constants/routes';

export const metadata: Metadata = buildStaticPageMetadata(
  'New Arrivals',
  'The latest timepieces to join the LUXE collection, newest first.',
  ROUTES.newArrivals
);

export default function NewArrivalsPage() {
  return (
    <>
      <ListingHeader
        title="New Arrivals"
        description="The latest pieces to join the collection, newest first. Each one authenticated by our watchmakers before it ships."
        breadcrumbs={[{ label: 'All Watches', href: ROUTES.shop }, { label: 'New Arrivals' }]}
      />
      {/* The ordering is the point of this page, so sort is fixed and hidden */}
      <ProductListing
        fixedFilters={{ sortBy: 'publishedAt', sortOrder: 'desc' }}
        showSort={false}
        empty={{
          title: 'Nothing new this week',
          description: 'New pieces arrive regularly. Explore the full collection in the meantime.',
          action: { label: 'Browse all watches', href: ROUTES.shop },
        }}
      />
    </>
  );
}
