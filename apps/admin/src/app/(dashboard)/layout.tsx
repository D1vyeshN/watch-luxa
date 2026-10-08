'use client';

import { Suspense } from 'react';
import { Authenticated } from '@refinedev/core';
import { Loader2 } from 'lucide-react';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { SkipLink } from '@/components/shared/skip-link';

export const dynamic = 'force-dynamic';

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <Authenticated
      key="authenticated-layout"
      redirectOnFail="/login"
      loading={
        <div className="flex min-h-screen items-center justify-center bg-background" suppressHydrationWarning>
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-forest-900 dark:text-cream-600" />
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Verifying session…
            </p>
          </div>
        </div>
      }
    >
      <SidebarProvider>
        <SkipLink />
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          {/* tabIndex -1: lets the skip link move focus here */}
          <main id="main-content" tabIndex={-1} className="flex-1 p-6 outline-none">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
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
        <div className="flex min-h-screen items-center justify-center bg-background" suppressHydrationWarning>
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
