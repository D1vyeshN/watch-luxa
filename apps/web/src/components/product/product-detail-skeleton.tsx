'use client';

import { Container } from '@/components/shared/container';

export function ProductDetailSkeleton() {
  return (
    <Container className="py-10 md:py-14">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <div className="h-96 rounded-xl bg-cream-50 border border-forest-900/15" />
        </div>
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="h-4 w-1/3 bg-cream-50 border border-forest-900/15" />
            <div className="h-10 w-3/4 rounded-full bg-cream-50 border border-forest-900/15" />
            <div className="h-4 w-1/4 bg-cream-50 border border-forest-900/15" />
          </div>
          <div className="h-4 w-full md:w-3/4 bg-cream-50 border border-forest-900/15" />
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-4 w-full bg-cream-50 border border-forest-900/15" />
            ))}
          </div>
          <div className="h-12 w-1/2 rounded-full bg-cream-50 border border-forest-900/15" />
        </div>
      </div>
    </Container>
  );
}
