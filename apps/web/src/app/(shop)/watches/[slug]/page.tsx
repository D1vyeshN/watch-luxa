import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ListingHeader, ProductListing } from '@/components/shop';
import { JsonLd, buildBreadcrumbJsonLd } from '@/components/seo/json-ld';
import { serverFetch } from '@/lib/api/server-fetch';
import { buildCategoryMetadata } from '@/lib/seo/metadata';
import { CATEGORY_ART } from '@/constants/home-art';
import { ROUTES } from '@/constants/routes';
import { env } from '@/config/env';
import type { ApiResponse } from '@/types/api';
import type { Category } from '@/types/catalog';

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getCategory(slug: string): Promise<Category | null> {
  const response = await serverFetch<ApiResponse<Category>>(`/categories/${slug}`, {
    revalidate: 300,
    tags: [`category-${slug}`],
  });
  return response?.data ?? null;
}

// Same artwork as the homepage tile, so the click lands somewhere familiar
const artFor = (category: Category) => CATEGORY_ART[category.slug] ?? category.image;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: 'Category not found' };

  return buildCategoryMetadata({
    name: category.name,
    description: category.description,
    slug: category.slug,
    image: artFor(category),
  });
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const site = env.NEXT_PUBLIC_SITE_URL;

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: 'All Watches', url: `${site}${ROUTES.shop}` },
          { name: category.name, url: `${site}${ROUTES.category(category.slug)}` },
        ])}
      />

      <ListingHeader
        title={category.name}
        description={category.description}
        imageUrl={artFor(category)}
        breadcrumbs={[
          { label: 'All Watches', href: ROUTES.shop },
          { label: category.name },
        ]}
      />

      <ProductListing
        fixedFilters={{ category: category.slug }}
        empty={{
          title: `No ${category.name.toLowerCase()} in stock right now`,
          description: 'New pieces arrive regularly. Explore the rest of the collection in the meantime.',
          action: { label: 'Browse all watches', href: ROUTES.shop },
        }}
      />
    </>
  );
}
