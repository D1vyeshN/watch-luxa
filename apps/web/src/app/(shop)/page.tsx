import { Container } from '@/components/shared/container';
import { Section } from '@/components/shared/section';
import { ProductGrid } from '@/components/product';
import {
  Hero,
  CategoryStrip,
  EditorialBanner,
  HeritageBlock,
  NewsletterCTA,
} from '@/components/home';
import { serverFetch } from '@/lib/api/server-fetch';
import { ROUTES } from '@/constants/routes';
import type { ApiResponse } from '@/types/api';
import type { HomeData } from '@/types/home';

export const revalidate = 300; // 5 minutes ISR

async function getHomeData(): Promise<HomeData | null> {
  const response = await serverFetch<ApiResponse<HomeData>>('/home', {
    revalidate: 300,
    tags: ['homepage'],
  });

  return response?.data ?? null;
}

export default async function HomePage() {
  const data = await getHomeData();

  if (!data) {
    return (
      <Container className="py-32">
        <div className="text-center">
          <p className="label-luxe">Connection error</p>
          <h1 className="heading-luxe mt-4 text-4xl">
            Unable to reach the store
          </h1>
          <p className="mt-4 text-sm text-ink-soft">
            Please make sure the API is running and try again.
          </p>
        </div>
      </Container>
    );
  }

  return (
    <>
      {/* 1. Hero */}
      <Hero />

      {/* 2. Category strip */}
      <CategoryStrip categories={data.categories} />

      {/* 3. Featured Watches */}
      {data.featured.length > 0 && (
        <Section spacing="lg" background="default">
          <Container>
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="label-luxe">Curated selection</p>
                <h2 className="heading-luxe mt-2 text-3xl md:text-4xl">
                  Featured Watches
                </h2>
              </div>
              <a
                href={`${ROUTES.shop}?featured=true`}
                className="hidden text-xs uppercase tracking-[0.18em] text-forest-900 underline-offset-4 hover:underline md:block"
              >
                View all
              </a>
            </div>

            <ProductGrid products={data.featured} columns={4} />
          </Container>
        </Section>
      )}

      {/* 4. Editorial banner */}
      <EditorialBanner
        overline="The Standard"
        headline="The New Standard of Time"
        body="A collection that honours the golden age of horology while embracing the precision of modern manufacturing. Each piece is designed to outlast trend, season, and generation."
        imageUrl="https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=1200&q=80"
        cta={{ label: 'Discover the collection', href: ROUTES.shop }}
      />

      {/* 5. Heritage block */}
      <HeritageBlock />

      {/* 6. New arrivals */}
      {data.newArrivals.length > 0 && (
        <Section spacing="lg" background="default">
          <Container>
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="label-luxe">Just arrived</p>
                <h2 className="heading-luxe mt-2 text-3xl md:text-4xl">
                  New Arrivals
                </h2>
              </div>
              <a
                href={ROUTES.newArrivals}
                className="hidden text-xs uppercase tracking-[0.18em] text-forest-900 underline-offset-4 hover:underline md:block"
              >
                View all
              </a>
            </div>

            <ProductGrid products={data.newArrivals} columns={4} />
          </Container>
        </Section>
      )}

      {/* 7. Trending */}
      {data.trending.length > 0 && (
        <Section spacing="lg" background="cream">
          <Container>
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="label-luxe">Most desired</p>
                <h2 className="heading-luxe mt-2 text-3xl md:text-4xl">
                  Trending Now
                </h2>
              </div>
              <a
                href={`${ROUTES.shop}?sortBy=soldCount`}
                className="hidden text-xs uppercase tracking-[0.18em] text-forest-900 underline-offset-4 hover:underline md:block"
              >
                View all
              </a>
            </div>

            <ProductGrid products={data.trending} columns={4} />
          </Container>
        </Section>
      )}

      {/* 8. Editorial banner (reversed) */}
      <EditorialBanner
        overline="Sovereign Atelier"
        headline="Heritage Élan"
        body="A tribute to the maison's earliest commission. Hand-finished bridges, mirror-polished cases, and dials that catch light the way water catches the sun."
        imageUrl="https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=1200&q=80"
        cta={{ label: 'Explore heritage', href: ROUTES.about }}
        reverse
      />

      {/* 9. Newsletter */}
      <NewsletterCTA />
    </>
  );
}
