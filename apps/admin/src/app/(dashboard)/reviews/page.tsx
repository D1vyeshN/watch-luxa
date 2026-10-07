'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewsTable } from '@/components/reviews/reviews-table';
import type { ReviewTab } from '@/types/review';

export default function ReviewsPage() {
  const [tab, setTab] = useState<ReviewTab>('pending');

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* ─── Header ─── */}
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Content
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Moderate customer reviews before they appear on the storefront.
        </p>
      </div>

      {/* ─── Tabs ─── */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as ReviewTab)}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* ─── Table (remounts per tab: fresh pagination + dialogs) ─── */}
      <ReviewsTable key={tab} tab={tab} />
    </div>
  );
}
