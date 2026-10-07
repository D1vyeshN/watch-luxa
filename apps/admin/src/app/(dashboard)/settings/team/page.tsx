'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CanAccess } from '@refinedev/core';
import { ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TeamTable } from '@/components/team/team-table';
import { InviteAdminDialog } from '@/components/team/invite-admin-dialog';
import { AccessDenied } from '@/components/shared/access-denied';
import { tokenStorage } from '@/lib/storage/tokenStorage';

export default function TeamPage() {
  // The env super admin (SUPER_ADMIN_EMAIL) has no users-collection record,
  // so it never shows in the table — say so instead of leaving it unexplained
  // (read after mount: localStorage isn't available during SSR)
  const [user, setUser] = useState<ReturnType<typeof tokenStorage.getUser>>(null);
  useEffect(() => setUser(tokenStorage.getUser()), []);
  const isEnvSuperadmin = user?._id === 'superadmin';

  return (
    <CanAccess
      resource="team"
      action="list"
      fallback={<AccessDenied message="Only superadmins can manage team members." />}
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
            <Link href="/settings">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Settings
            </Link>
          </Button>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                System
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">Team Management</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Add and deactivate admin users.
              </p>
            </div>
            <InviteAdminDialog />
          </div>
        </div>

        {isEnvSuperadmin && (
          <div className="flex gap-3 rounded-md border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <p>
              You&apos;re signed in as the owner account ({user?.email}), configured in the API&apos;s{' '}
              <code className="font-mono">.env</code>. It isn&apos;t listed below and can&apos;t be
              deactivated here.
            </p>
          </div>
        )}

        <TeamTable />
      </div>
    </CanAccess>
  );
}
