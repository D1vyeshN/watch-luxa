'use client';

import Link from 'next/link';
import { CanAccess } from '@refinedev/core';
import { Shield, ScrollText, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SettingsForm } from '@/components/settings/settings-form';
import { AccessDenied } from '@/components/shared/access-denied';

const SYSTEM_LINKS = [
  {
    href: '/settings/team',
    icon: Shield,
    title: 'Team Management',
    description: 'Invite and manage admin users',
  },
  {
    href: '/settings/audit-logs',
    icon: ScrollText,
    title: 'Audit Logs',
    description: 'Every admin change, with who and when',
  },
];

export default function SettingsPage() {
  return (
    // Settings change tax / shipping / returns for every order — superadmin
    // only (accessControlProvider + authorize('superadmin') on PUT)
    <CanAccess
      resource="settings"
      action="list"
      fallback={<AccessDenied message="Only superadmins can change store settings." />}
    >
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            System
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Store identity, shipping, tax, and returns. Checkout uses these immediately.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {SYSTEM_LINKS.map(({ href, icon: Icon, title, description }) => (
            <Link key={href} href={href} className="group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Card className="transition-colors group-hover:border-foreground/20">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Icon className="h-4 w-4" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <SettingsForm />
      </div>
    </CanAccess>
  );
}
