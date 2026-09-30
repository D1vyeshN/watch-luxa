import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ProductDetailContent } from '@/components/product/product-detail-content';
import { RelatedProducts } from '@/components/product/related-products';
import { JsonLd, buildProductJsonLd, buildBreadcrumbJsonLd } from '@/components/seo/json-ld';
import { serverFetch } from '@/lib/api/server-fetch';
import { buildProductMetadata } from '@/lib/seo/metadata';
import { env } from '@/config/env';
import type { ApiResponse, Paginated } from '@/types/api';
import type { Product } from '@/types/catalog';

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string): Promise<Product | null> {
  const response = await serverFetch<ApiResponse<Product>>(
    `/products/${slug}`,
    { revalidate: 300, tags: [`product-${slug}`] }
  );
  return response?.data ?? null;
}

async function getRelated(slug: string): Promise<Product[]> {
  const response = await serverFetch<ApiResponse<Product[]>>(
    `/products/${slug}/related?limit=4`,
    { revalidate: 300 }
  );
  return response?.data ?? [];
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: 'Product not found' };
  }

  return buildProductMetadata({
    name: product.name,
    description: product.shortDescription,
    image: product.heroImage,
    slug: product.slug,
    price: product.basePrice,
    brandName: product.brand?.name,
  });
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const [product, related] = await Promise.all([
    getProduct(slug),
    getRelated(slug),
  ]);

  if (!product) {
    notFound();
  }

  const productJsonLd = buildProductJsonLd({
    name: product.name,
    description: product.shortDescription,
    image: [product.heroImage, ...(product.images ?? [])].slice(0, 4),
    slug: product.slug,
    sku: product.specs?.referenceNumber ?? product.slug,
    brandName: product.brand?.name ?? 'LUXE',
    price: product.basePrice,
    currency: 'INR',
    inStock: product.inStock,
    siteUrl: env.NEXT_PUBLIC_SITE_URL,
  });

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', url: env.NEXT_PUBLIC_SITE_URL },
    { name: 'Shop', url: `${env.NEXT_PUBLIC_SITE_URL}/shop` },
    { name: product.brand?.name ?? 'Brand', url: `${env.NEXT_PUBLIC_SITE_URL}/shop` },
    { name: product.name, url: `${env.NEXT_PUBLIC_SITE_URL}/product/${product.slug}` },
  ]);

  return (
    <>
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <ProductDetailContent product={product} />
      <RelatedProducts products={related} />
    </>
  );
}

export async function generateStaticParams() {
  // Pre-render top 20 products at build time
  const response = await serverFetch<Paginated<Product>>(
    '/products?limit=20&sortBy=featured',
    { revalidate: 3600 }
  );

  return (response?.data ?? []).map((p) => ({ slug: p.slug }));
}
