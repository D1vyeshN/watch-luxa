'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/shared/container';
import { Section } from '@/components/shared/section';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { LoadingScreen, LoadingSpinner } from '@/components/shared/loading-spinner';

export default function TestStatesPage() {
  const [showLoading, setShowLoading] = useState(false);

  return (
    <Container className="py-16">
      <p className="label-luxe">Step 5 — Global States</p>
      <h1 className="heading-luxe mt-3 text-5xl">Error handling ready.</h1>

      <Section spacing="md">
        <h2 className="heading-luxe text-2xl">Loading Spinner</h2>
        <div className="mt-4 flex items-center gap-6">
          <LoadingSpinner size="sm" />
          <LoadingSpinner size="md" />
          <LoadingSpinner size="lg" />
        </div>
      </Section>

      <Section spacing="md">
        <h2 className="heading-luxe text-2xl">Loading Screen (toggle)</h2>
        <button
          onClick={() => setShowLoading((v) => !v)}
          className="mt-4 rounded-sm bg-forest-900 px-4 py-2 text-xs uppercase tracking-widest text-cream-100"
        >
          {showLoading ? 'Hide' : 'Show'}
        </button>
        {showLoading && <LoadingScreen message="Preparing your timepiece…" />}
      </Section>

      <Section spacing="md">
        <h2 className="heading-luxe text-2xl">Empty State</h2>
        <EmptyState
          title="Your cart is empty"
          description="Explore our collection of exceptional timepieces."
          action={{ label: 'Shop watches', href: '/shop' }}
        />
      </Section>

      <Section spacing="md">
        <h2 className="heading-luxe text-2xl">Error State</h2>
        <ErrorState onRetry={() => alert('Retry clicked')} />
      </Section>

      <Section spacing="md">
        <h2 className="heading-luxe text-2xl">Route-based States</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/this-page-does-not-exist"
            className="rounded-sm border border-forest-900 px-4 py-2 text-xs uppercase tracking-widest text-forest-900 hover:bg-forest-900 hover:text-cream-100"
          >
            Trigger 404
          </Link>
          <Link
            href="/trigger-error"
            className="rounded-sm border border-red-600 px-4 py-2 text-xs uppercase tracking-widest text-red-600 hover:bg-red-600 hover:text-white"
          >
            Trigger error boundary
          </Link>
        </div>
      </Section>
    </Container>
  );
}
