import type { Metadata } from 'next';
import { ListingHeader, ProductListing } from '@/components/shop';
import { buildStaticPageMetadata } from '@/lib/seo/metadata';
import { ROUTES } from '@/constants/routes';

export const metadata: Metadata = buildStaticPageMetadata(
  'All Watches',
  'Browse every timepiece at LUXE: dress, dive, pilot and complication watches, each authenticated in-house.',
  ROUTES.shop
);

export default function ShopPage() {
  return (
    <>
      <ListingHeader
        title="All Watches"
        description="Every piece in the collection, each one authenticated by our watchmakers before it ships."
      />
      <ProductListing />
    </>
  );
}
