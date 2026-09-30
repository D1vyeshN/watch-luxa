'use client';

import {
  useGetHomeDataQuery,
  useGetProductsQuery,
  useGetCategoriesQuery,
} from '@/store/api/endpoints';
import { formatPrice } from '@/lib/utils';

export default function Step3TestPage() {
  const home = useGetHomeDataQuery();
  const products = useGetProductsQuery({ limit: 4 });
  const categories = useGetCategoriesQuery();

  return (
    <div className="container-luxe py-16">
      <p className="label-luxe">Step 3 — RTK Query Endpoints</p>
      <h1 className="heading-luxe mt-3 text-5xl">Connected to backend.</h1>

      {/* Home aggregate */}
      <section className="mt-12">
        <h2 className="heading-luxe text-2xl">Home Data</h2>
        {home.isLoading && <p className="text-sm text-ink-muted">Loading…</p>}
        {home.error && (
          <p className="text-sm text-red-600">
            Error: is the backend running at port 5000?
          </p>
        )}
        {home.data && (
          <ul className="mt-3 space-y-1 text-sm text-ink-soft">
            <li>Featured products: {home.data.data.featured.length}</li>
            <li>New arrivals: {home.data.data.newArrivals.length}</li>
            <li>Trending: {home.data.data.trending.length}</li>
            <li>Categories: {home.data.data.categories.length}</li>
            <li>Brands: {home.data.data.brands.length}</li>
            <li>Collections: {home.data.data.collections.length}</li>
          </ul>
        )}
      </section>

      {/* Products */}
      <section className="mt-12">
        <h2 className="heading-luxe text-2xl">Products</h2>
        {products.isLoading && <p className="text-sm text-ink-muted">Loading…</p>}
        {products.error && (
          <p className="text-sm text-red-600">Could not fetch products.</p>
        )}
        {products.data && (
          <>
            <p className="mt-2 text-sm text-ink-muted">
              Total: {products.data.pagination.total}
            </p>
            <ul className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {products.data.data.map((p) => (
                <li
                  key={p.id}
                  className="rounded-sm border border-forest-900/10 bg-white p-4"
                >
                  <p className="text-xs uppercase tracking-widest text-ink-muted">
                    {p.brand?.name ?? 'Unknown brand'}
                  </p>
                  <p className="heading-luxe mt-1 text-lg">{p.name}</p>
                  <p className="mt-2 text-sm text-forest-900">
                    {formatPrice(p.priceRange.min)}
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {/* Categories */}
      <section className="mt-12">
        <h2 className="heading-luxe text-2xl">Categories</h2>
        {categories.isLoading && <p className="text-sm text-ink-muted">Loading…</p>}
        {categories.data && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {categories.data.data.map((c) => (
              <li
                key={c.id}
                className="rounded-sm border border-forest-900/20 px-3 py-1 text-xs uppercase tracking-widest text-forest-900"
              >
                {c.name}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
