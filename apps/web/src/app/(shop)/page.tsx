import Link from 'next/link';
import { Container } from '@/components/shared/container';
import { Hero, HomeSections } from '@/components/home';
import { serverFetch } from '@/lib/api/server-fetch';
import { ROUTES } from '@/constants/routes';
import { DEFAULT_HOME_SECTIONS } from '@/constants/home-sections';
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

  return (
    <>
      {/* Both managed in admin → Homepage */}
      <Hero config={data.hero} />
      <HomeSections sections={data.sections ?? DEFAULT_HOME_SECTIONS} data={data} />
    </>
  );
}
