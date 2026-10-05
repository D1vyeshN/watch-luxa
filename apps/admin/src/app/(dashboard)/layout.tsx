'use client';

import { Suspense } from 'react';
import { Authenticated } from '@refinedev/core';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <Authenticated
      key="authenticated-layout"
      redirectOnFail="/login"
      loading={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-forest-900" />
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Verifying session…
            </p>
          </div>
        </div>
      }
    >
      {children}
    </Authenticated>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-forest-900" />
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Loading…
            </p>
          </div>
        </div>
      }
    >
      <AuthenticatedLayout>{children}</AuthenticatedLayout>
    </Suspense>
  );
}
