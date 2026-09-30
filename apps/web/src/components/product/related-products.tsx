import Link from 'next/link';
import { Container } from '@/components/shared/container';
import { Section } from '@/components/shared/section';
import { ProductGrid } from './product-grid';
import { ROUTES } from '@/constants/routes';
import type { Product } from '@/types/catalog';

interface RelatedProductsProps {
  products: Product[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <Section spacing="lg" background="cream">
      <Container>
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="label-luxe">Continue exploring</p>
            <h2 className="heading-luxe mt-2 text-3xl md:text-4xl">
              You may also like
            </h2>
          </div>
          <Link
            href={ROUTES.shop}
            className="hidden text-xs uppercase tracking-[0.18em] text-forest-900 underline-offset-4 hover:underline md:block"
          >
            View all
          </Link>
        </div>

        <ProductGrid products={products} columns={4} />
      </Container>
    </Section>
  );
}
