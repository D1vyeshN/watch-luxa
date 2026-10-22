import Link from 'next/link';
import { Container } from '@/components/shared/container';
import { Section } from '@/components/shared/section';
import { ProductGrid } from '@/components/product';
import {
  Hero,
  CategoryBento,
  EditorialBanner,
  MaisonSection,
  ServicesStagger,
  HomeFaq,
  SectionHeader,
} from '@/components/home';
import { serverFetch } from '@/lib/api/server-fetch';
import { ROUTES } from '@/constants/routes';
import { FAQ_GROUPS } from '@/constants/faq';
import { HOME_ART } from '@/constants/home-art';
import type { ApiResponse } from '@/types/api';
import type { Product } from '@/types/catalog';
import type { HomeData } from '@/types/home';

export const revalidate = 300; // 5 minutes ISR

// One row per rail keeps the page scannable; "View all" leads to the rest
const RAIL_SIZE = 4;

// The questions people ask before buying, in the order they ask them
const HOME_FAQ = [
  FAQ_GROUPS[0].items[0], // authentic?
  FAQ_GROUPS[0].items[1], // box and papers?
  FAQ_GROUPS[1].items[1], // insured?
  FAQ_GROUPS[2].items[0], // returns
  FAQ_GROUPS[3].items[0], // warranty
].filter(Boolean);

async function getHomeData(): Promise<HomeData | null> {
  const response = await serverFetch<ApiResponse<HomeData>>('/home', {
    revalidate: 300,
    tags: ['homepage'],
  });

  return response?.data ?? null;
}

interface ProductRailProps {
  title: string;
  description: string;
  href: string;
  products: Product[];
  background: 'default' | 'cream';
}

function ProductRail({ title, description, href, products, background }: ProductRailProps) {
  if (products.length === 0) return null;

  return (
    <Section spacing="lg" background={background}>
      <Container>
        <SectionHeader title={title} description={description} viewAll={{ href }} />
        {/* Below the fold — the hero image is the only priority fetch */}
        <ProductGrid
          products={products.slice(0, RAIL_SIZE)}
          columns={4}
          priorityCount={0}
          className="md:grid-cols-2 lg:grid-cols-4"
        />
      </Container>
    </Section>
  );
}

export default async function HomePage() {
  const data = await getHomeData();

  if (!data) {
    return (
      <Container className="py-32">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="heading-luxe text-4xl">We couldn&rsquo;t load the homepage</h1>
          <p className="mt-4 text-base text-ink-soft">
            Refresh the page in a moment, or continue to the full collection.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {/* Plain <a> forces a fresh server render */}
            <a
              href={ROUTES.home}
              className="inline-flex items-center bg-forest-900 px-8 py-4 text-xs font-medium uppercase tracking-[0.18em] text-cream-100 transition-colors hover:bg-forest-800"
            >
              Try again
            </a>
            <Link
              href={ROUTES.shop}
              className="inline-flex items-center border border-forest-900/30 px-8 py-4 text-xs font-medium uppercase tracking-[0.18em] text-forest-900 transition-colors hover:border-forest-900"
            >
              Browse watches
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  // Backgrounds alternate so neighbouring sections never merge:
  // hero → cream-100 → cream-200 → cream-100 → image → cream-100 → cream-200 → cream-100 → footer
  return (
    <>
      <Hero config={data.hero} />

      <CategoryBento categories={data.categories} />

      <ProductRail
        title="Featured Watches"
        description="Chosen by our horologists this season."
        href={`${ROUTES.shop}?featured=true`}
        products={data.featured}
        background="cream"
      />

      <MaisonSection
        headline="Every watch passes a watchmaker’s bench"
        body="Before a piece reaches you, our in-house team opens the paperwork, checks the serial and inspects the movement. It is the slow part of what we do, and the part we will never hurry."
        imageUrl={HOME_ART.maison}
        pillars={[
          {
            title: 'Authenticated in-house',
            body: 'No replicas, homages or unauthorised editions. Ever.',
          },
          {
            title: 'Box and papers',
            body: 'Original box, papers and warranty card, unless stated otherwise.',
          },
          {
            title: '12-month guarantee',
            body: 'Our own service guarantee, on top of any manufacturer warranty.',
          },
        ]}
        cta={{ label: 'Our story', href: ROUTES.about }}
        // Featured (cream-200) normally separates this from the cream-100 bento grid;
        // without it, switch tone so the two sections don't merge
        background={data.featured.length > 0 ? 'default' : 'cream'}
      />

      <EditorialBanner
        variant="immersive"
        headline="Heritage Élan"
        body="A tribute to the maison's earliest commission. Hand-finished bridges, mirror-polished cases, and dials that catch light the way water catches the sun."
        imageUrl={HOME_ART.editorial}
        cta={{ label: 'Explore heritage', href: ROUTES.craftsmanship }}
      />

      <ProductRail
        title="New Arrivals"
        description="The latest additions to the collection."
        href={ROUTES.newArrivals}
        products={data.newArrivals}
        background="default"
      />

      <ServicesStagger
        title="Bought with care, delivered with care"
        description="The service around the watch matters as much as the watch."
        backgroundImage={HOME_ART.services}
        services={[
          {
            title: 'Insured delivery',
            body: 'Every order is fully insured in transit and needs a signature on arrival.',
            link: { label: 'Shipping details', href: ROUTES.shipping },
          },
          {
            title: 'Private viewing',
            body: 'A one-on-one session with a LUXE specialist. See pieces up close, try them on, and ask anything.',
            link: { label: 'Book a viewing', href: ROUTES.privateViewing },
          },
          {
            title: '14-day returns',
            body: 'Changed your mind? Return an unworn piece in its original packaging within 14 days.',
            link: { label: 'Returns policy', href: ROUTES.returns },
          },
        ]}
      />

      <HomeFaq
        title="Questions, answered"
        description="What people usually ask before buying their first piece from us."
        items={HOME_FAQ}
      />
    </>
  );
}
