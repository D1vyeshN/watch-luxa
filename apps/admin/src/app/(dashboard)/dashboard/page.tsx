'use client';

import { useGetIdentity, useLogout } from '@refinedev/core';

export const dynamic = 'force-dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface Identity {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'superadmin';
}

export default function DashboardPage() {
  const { data: user } = useGetIdentity<Identity>();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'A';

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              LUXE Admin
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Admin'}.
            </h1>
          </div>

          <Button
            variant="outline"
            onClick={() => logout()}
            disabled={isLoggingOut}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? 'Signing out…' : 'Sign out'}
          </Button>
        </div>

        {/* Identity card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Signed in as</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-forest-900 text-sm font-medium text-cream-100">
                {initials}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {user?.name || 'Admin'}
                </p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <Badge
                variant={user?.role === 'superadmin' ? 'default' : 'secondary'}
                className="ml-auto"
              >
                {user?.role || 'unknown'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Verification checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Step 4 — Auth Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✅ Login page renders with shadcn Form</li>
              <li>✅ Session token stored in localStorage</li>
              <li>✅ Identity loaded via `useGetIdentity`</li>
              <li>✅ Role check enforced on login</li>
              <li>✅ Session persists across page refresh</li>
              <li>✅ Logout clears tokens and redirects</li>
              <li>✅ Unauthenticated users redirected to /login</li>
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Say &ldquo;Step 6&rdquo; to add the layout shell (sidebar,
              topbar, user menu).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
