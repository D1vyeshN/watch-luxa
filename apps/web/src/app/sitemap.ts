import type { MetadataRoute } from 'next';
import { env } from '@/config/env';
import { ROUTES } from '@/constants/routes';
import { JOURNAL_POSTS } from '@/lib/content/journal';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;
const API_URL = env.NEXT_PUBLIC_API_URL;

interface ProductRef {
  slug: string;
  createdAt?: string;
}

interface SimpleRef {
  slug: string;
}

async function fetchList<T>(path: string): Promise<T[]> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}${ROUTES.home}`, lastModified: now, priority: 1 },
    { url: `${SITE_URL}${ROUTES.shop}`, lastModified: now, priority: 0.9 },
    { url: `${SITE_URL}${ROUTES.newArrivals}`, lastModified: now, priority: 0.8 },
    { url: `${SITE_URL}${ROUTES.collections}`, lastModified: now, priority: 0.8 },
    { url: `${SITE_URL}${ROUTES.brands}`, lastModified: now, priority: 0.7 },
    { url: `${SITE_URL}${ROUTES.journal}`, lastModified: now, priority: 0.7 },
    { url: `${SITE_URL}${ROUTES.about}`, lastModified: now, priority: 0.6 },
    { url: `${SITE_URL}${ROUTES.craftsmanship}`, lastModified: now, priority: 0.6 },
    { url: `${SITE_URL}${ROUTES.faq}`, lastModified: now, priority: 0.5 },
    { url: `${SITE_URL}${ROUTES.contact}`, lastModified: now, priority: 0.5 },
    { url: `${SITE_URL}${ROUTES.warranty}`, lastModified: now, priority: 0.5 },
    { url: `${SITE_URL}${ROUTES.stores}`, lastModified: now, priority: 0.5 },
    { url: `${SITE_URL}${ROUTES.privateViewing}`, lastModified: now, priority: 0.5 },
    { url: `${SITE_URL}${ROUTES.returns}`, lastModified: now, priority: 0.5 },
    { url: `${SITE_URL}${ROUTES.shipping}`, lastModified: now, priority: 0.4 },
    { url: `${SITE_URL}${ROUTES.privacy}`, lastModified: now, priority: 0.3 },
    { url: `${SITE_URL}${ROUTES.terms}`, lastModified: now, priority: 0.3 },
  ];

  // Dynamic pages
  const [products, brands, categories, collections] = await Promise.all([
    fetchList<ProductRef>('/products?limit=500'),
    fetchList<SimpleRef>('/brands?limit=100'),
    fetchList<SimpleRef>('/categories'),
    fetchList<SimpleRef>('/collections'),
  ]);

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}${ROUTES.product(p.slug)}`,
    lastModified: p.createdAt ? new Date(p.createdAt) : now,
    priority: 0.9,
  }));

  const brandRoutes: MetadataRoute.Sitemap = brands.map((b) => ({
    url: `${SITE_URL}${ROUTES.brand(b.slug)}`,
    lastModified: now,
    priority: 0.7,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}${ROUTES.category(c.slug)}`,
    lastModified: now,
    priority: 0.8,
  }));

  const collectionRoutes: MetadataRoute.Sitemap = collections.map((c) => ({
    url: `${SITE_URL}${ROUTES.collection(c.slug)}`,
    lastModified: now,
    priority: 0.8,
  }));

  const journalRoutes: MetadataRoute.Sitemap = JOURNAL_POSTS.map((post) => ({
    url: `${SITE_URL}${ROUTES.journalPost(post.slug)}`,
    lastModified: new Date(post.publishedAt),
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...productRoutes,
    ...brandRoutes,
    ...categoryRoutes,
    ...collectionRoutes,
    ...journalRoutes,
  ];
}
