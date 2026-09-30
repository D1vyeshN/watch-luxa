import type { Metadata } from 'next';
import { env } from '@/config/env';

const SITE_NAME = env.NEXT_PUBLIC_SITE_NAME;
const SITE_URL = env.NEXT_PUBLIC_SITE_URL;

interface ProductSeoInput {
  name: string;
  description: string;
  image: string;
  slug: string;
  price: number;
  brandName?: string;
}

export function buildProductMetadata(product: ProductSeoInput): Metadata {
  const title = product.brandName
    ? `${product.name} — ${product.brandName}`
    : product.name;

  return {
    title,
    description: product.description,
    alternates: { canonical: `${SITE_URL}/product/${product.slug}` },
    openGraph: {
      title,
      description: product.description,
      images: [{ url: product.image, width: 1200, height: 630 }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: product.description,
      images: [product.image],
    },
  };
}

interface CategorySeoInput {
  name: string;
  description?: string;
  slug: string;
  image?: string;
}

export function buildCategoryMetadata(category: CategorySeoInput): Metadata {
  const title = `${category.name} Watches`;
  const description =
    category.description ??
    `Explore our curated collection of ${category.name.toLowerCase()}.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/watches/${category.slug}` },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      images: category.image ? [{ url: category.image }] : undefined,
      type: 'website',
    },
  };
}

export function buildStaticPageMetadata(
  title: string,
  description: string,
  path: string
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}${path}` },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      type: 'website',
    },
  };
}
