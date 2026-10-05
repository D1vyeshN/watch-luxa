'use client';

import { useGetIdentity } from '@refinedev/core';

export const dynamic = 'force-dynamic';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Identity {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'superadmin';
}

export default function DashboardPage() {
  const { data: user } = useGetIdentity<Identity>();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Overview
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'Admin'}.
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&rsquo;s what&rsquo;s happening across the store.
          </p>
        </div>

        <Badge
          variant={user?.role === 'superadmin' ? 'default' : 'secondary'}
        >
          {user?.role}
        </Badge>
      </div>

      {/* Verification card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Step 6 — Layout Shell Ready</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✅ Sidebar with grouped navigation</li>
            <li>✅ Collapsible (click the trigger or use ⌘/Ctrl+B)</li>
            <li>✅ Breadcrumbs update per route</li>
            <li>✅ Theme toggle (light / dark)</li>
            <li>✅ User menu with role + sign out</li>
            <li>✅ Mobile responsive (sidebar becomes a sheet)</li>
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Click any sidebar link to navigate. Say &ldquo;Step 7&rdquo; to build
            the real dashboard with charts and KPIs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
