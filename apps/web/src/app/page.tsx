'use client';

import { useState } from 'react';
import {
  formatPrice,
  formatPriceCompact,
  formatPriceRange,
  formatDate,
  formatRelativeTime,
} from '@/lib/format';
import { useDebounce } from '@/hooks/useDebounce';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { toast } from '@/hooks/useToast';

export default function Step4TestPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const isMobile = useIsMobile();

  // Fixed date for relative time demo (1 hour ago from a fixed timestamp)
  const oneHourAgo = new Date('2024-01-01T12:00:00Z');

  return (
    <div className="container-luxe py-20">
      <p className="label-luxe">Step 4 — Utilities</p>
      <h1 className="heading-luxe mt-3 text-5xl">Helpers ready.</h1>

      {/* Formatting */}
      <section className="mt-12">
        <h2 className="heading-luxe text-2xl">Price & Date Formatting</h2>
        <ul className="mt-4 space-y-2 text-sm text-ink-soft">
          <li>
            Full price:{' '}
            <span className="text-forest-900">{formatPrice(850_000)}</span>
          </li>
          <li>
            Compact: {formatPriceCompact(850_000_00)} /{' '}
            {formatPriceCompact(85_000_000_00)} / {formatPriceCompact(8_500_00)}
          </li>
          <li>
            Range:{' '}
            {formatPriceRange(850_000, 1_200_000)}
          </li>
          <li>Date: {formatDate(new Date())}</li>
          <li>Relative: {formatRelativeTime(oneHourAgo)}</li>
        </ul>
      </section>

      {/* Debounce */}
      <section className="mt-12">
        <h2 className="heading-luxe text-2xl">Debounced Input (400ms)</h2>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Type something…"
          className="mt-3 w-full max-w-sm rounded-sm border border-forest-900/20 bg-white px-4 py-3 text-sm outline-none focus:border-forest-900"
        />
        <p className="mt-3 text-sm text-ink-muted">
          Typed: <strong>{search || '—'}</strong> | Debounced:{' '}
          <strong>{debouncedSearch || '—'}</strong>
        </p>
      </section>

      {/* Media query */}
      <section className="mt-12">
        <h2 className="heading-luxe text-2xl">Responsive Detection</h2>
        <p className="mt-3 text-sm text-ink-soft">
          Currently: {isMobile ? 'Mobile' : 'Desktop'}
        </p>
      </section>

      {/* Toasts */}
      <section className="mt-12">
        <h2 className="heading-luxe text-2xl">Toasts</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => toast.success('Added to cart')}
            className="rounded-sm bg-forest-900 px-4 py-2 text-xs uppercase tracking-widest text-cream-100"
          >
            Success
          </button>
          <button
            onClick={() => toast.error('Something went wrong')}
            className="rounded-sm border border-red-600 px-4 py-2 text-xs uppercase tracking-widest text-red-600"
          >
            Error
          </button>
          <button
            onClick={() => toast.addedToCart()}
            className="rounded-sm border border-forest-900/20 px-4 py-2 text-xs uppercase tracking-widest text-forest-900"
          >
            Preset: Added to cart
          </button>
        </div>
      </section>
    </div>
  );
}
