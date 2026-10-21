import Link from 'next/link';
import type { Metadata } from 'next';
import { Search } from 'lucide-react';
import { Container } from '@/components/shared/container';
import { ListingHeader, ProductListing } from '@/components/shop';
import { serverFetch } from '@/lib/api/server-fetch';
import { ROUTES } from '@/constants/routes';
import type { ApiResponse } from '@/types/api';
import type { Category } from '@/types/catalog';
import type { SearchResult } from '@/types/search';

interface PageProps {
  searchParams: Promise<{ q?: string | string[] }>;
}

const readQuery = (q: string | string[] | undefined) =>
  (Array.isArray(q) ? q[0] : q)?.trim().slice(0, 100) ?? '';

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const q = readQuery((await searchParams).q);
  return {
    title: q ? `Search: ${q}` : 'Search',
    // Result pages are endless and thin; keep them out of the index
    robots: { index: false, follow: true },
  };
}

async function getMatchingBrands(q: string) {
  const response = await serverFetch<ApiResponse<SearchResult>>(
    `/search?q=${encodeURIComponent(q)}`,
    { revalidate: 60 }
  );
  return response?.data?.brands ?? [];
}

async function getCategories() {
  const response = await serverFetch<ApiResponse<Category[]>>('/categories', {
    revalidate: 300,
    tags: ['categories'],
  });
  return response?.data ?? [];
}

function SearchForm({ defaultValue }: { defaultValue: string }) {
  // A plain GET form: works before JavaScript loads, and the URL is shareable
  return (
    <form action={ROUTES.search} role="search" className="mt-8 max-w-2xl">
      <label htmlFor="search-q" className="sr-only">
        Search watches
      </label>
      <div className="flex items-center border-b border-forest-900/40 focus-within:border-forest-900">
        <Search aria-hidden className="h-5 w-5 shrink-0 text-ink-soft" />
        <input
          id="search-q"
          name="q"
          type="search"
          defaultValue={defaultValue}
          placeholder="Model, brand or reference…"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          autoFocus={!defaultValue}
          className="min-w-0 flex-1 bg-transparent px-3 py-4 font-serif text-2xl text-forest-900 outline-none placeholder:text-ink-muted md:text-3xl [&::-webkit-search-cancel-button]:hidden"
        />
        <button
          type="submit"
          className="shrink-0 px-2 py-3 text-xs uppercase tracking-[0.18em] text-forest-900 hover:text-cream-700"
        >
          Search
        </button>
      </div>
    </form>
  );
}

export default async function SearchPage({ searchParams }: PageProps) {
  const q = readQuery((await searchParams).q);

  if (!q) {
    const categories = await getCategories();
    return (
      <>
        <ListingHeader title="Search" description="Find a piece by model, brand or reference number.">
          <SearchForm defaultValue="" />
        </ListingHeader>

        {categories.length > 0 && (
          <Container className="py-10 md:py-14">
            <h2 className="heading-luxe text-2xl md:text-3xl">Or start with a category</h2>
            <ul className="mt-6 flex flex-wrap gap-3">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={ROUTES.category(c.slug)}
                    className="inline-flex border border-forest-900/20 px-5 py-3 text-sm text-forest-900 transition-colors hover:border-forest-900"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        )}
      </>
    );
  }

  const brands = await getMatchingBrands(q);

  return (
    <>
      <ListingHeader title={`Results for “${q}”`}>
        <SearchForm defaultValue={q} />

        {brands.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
            <span className="text-ink-soft">Matching brands</span>
            {brands.map((b) => (
              <Link
                key={b.id}
                href={ROUTES.brand(b.slug)}
                className="border border-forest-900/20 px-4 py-2 text-forest-900 transition-colors hover:border-forest-900"
              >
                {b.name}
              </Link>
            ))}
          </div>
        )}
      </ListingHeader>

      {/* key: a new query is a new listing (resets RTK state and scroll) */}
      <ProductListing
        key={q}
        fixedFilters={{ search: q }}
        empty={{
          title: `No watches match “${q}”`,
          description: 'Check the spelling, try a brand or model name, or browse the full collection.',
          action: { label: 'Browse all watches', href: ROUTES.shop },
        }}
      />
    </>
  );
}
