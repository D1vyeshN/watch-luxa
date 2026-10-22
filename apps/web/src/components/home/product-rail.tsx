import { Container } from '@/components/shared/container';
import { Section } from '@/components/shared/section';
import { ProductGrid } from '@/components/product';
import type { Product } from '@/types/catalog';
import type { HomeLink } from '@/types/home';
import { SectionHeader } from './section-header';

interface ProductRailProps {
  title: string;
  description?: string;
  viewAll?: HomeLink;
  products: Product[];
  limit: number;
  background?: 'default' | 'cream';
}

// One row of products with a "View all" route to the rest
export function ProductRail({
  title,
  description,
  viewAll,
  products,
  limit,
  background = 'default',
}: ProductRailProps) {
  if (products.length === 0) return null;

  return (
    <Section spacing="lg" background={background}>
      <Container>
        <SectionHeader title={title} description={description} viewAll={viewAll} />
        {/* Below the fold — the hero image is the only priority fetch */}
        <ProductGrid
          products={products.slice(0, limit)}
          columns={4}
          priorityCount={0}
          className="md:grid-cols-2 lg:grid-cols-4"
        />
      </Container>
    </Section>
  );
}
