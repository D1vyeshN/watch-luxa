'use client';

import { Container } from '@/components/shared/container';
import { ProductGrid } from '@/components/product';
import { useGetProductsQuery } from '@/store/api/endpoints/products';

export default function Step7TestPage() {
  const { data, isLoading, error, refetch } = useGetProductsQuery({ limit: 8 });

  return (
    <Container className="py-16">
      <p className="label-luxe">Step 7 — Product Components</p>
      <h1 className="heading-luxe mt-3 text-5xl">Product grid ready.</h1>

      <div className="mt-12">
        {error && (
          <div className="rounded-sm border border-red-200 bg-red-50 p-6">
            <p className="text-sm text-red-700">
              Could not load products. Is the backend running?
            </p>
            <button
              onClick={refetch}
              className="mt-3 text-xs uppercase tracking-widest text-red-700 underline"
            >
              Retry
            </button>
          </div>
        )}

        {data && (
          <>
            <div className="mb-8 flex items-baseline justify-between">
              <h2 className="heading-luxe text-2xl">
                All Watches
              </h2>
              <p className="text-xs uppercase tracking-widest text-ink-muted">
                {data.pagination.total} pieces
              </p>
            </div>

            <ProductGrid
              products={data.data}
              isLoading={isLoading}
              columns={4}
            />
          </>
        )}

        {isLoading && (
          <>
            <div className="mb-8">
              <h2 className="heading-luxe text-2xl">All Watches</h2>
            </div>
            <ProductGrid products={[]} isLoading columns={4} />
          </>
        )}
      </div>
    </Container>
  );
}
