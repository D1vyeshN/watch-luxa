'use client';

import { Suspense } from 'react';
import { Authenticated } from '@refinedev/core';

export const dynamic = 'force-dynamic';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <Authenticated
        key="authenticated-layout"
        redirectOnFail="/login"
        loading={<div style={{ padding: 24 }}>Verifying session…</div>}
      >
        {children}
      </Authenticated>
    </Suspense>
  );
}
