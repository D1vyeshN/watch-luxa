import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export function CartEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center md:py-28">
      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-forest-900/10 bg-cream-100">
        <ShoppingBag className="h-8 w-8 text-forest-900" strokeWidth={1.25} />
      </div>

      <h2 className="heading-luxe mt-8 text-3xl md:text-4xl">
        Your cart is empty
      </h2>

      <p className="mt-4 max-w-md text-sm text-ink-soft md:text-base">
        Explore our collection of exceptional timepieces. Every piece is
        selected for its craftsmanship and character.
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link
          href={ROUTES.shop}
          className="inline-flex items-center justify-center rounded-sm bg-forest-900 px-8 py-4 text-xs uppercase tracking-[0.18em] text-cream-100 transition-colors hover:bg-forest-800"
        >
          Browse All Watches
        </Link>
        <Link
          href={`${ROUTES.shop}?sortBy=newest`}
          className="inline-flex items-center justify-center rounded-sm border border-forest-900 px-8 py-4 text-xs uppercase tracking-[0.18em] text-forest-900 transition-colors hover:bg-forest-900 hover:text-cream-100"
        >
          New Arrivals
        </Link>
      </div>
    </div>
  );
}
