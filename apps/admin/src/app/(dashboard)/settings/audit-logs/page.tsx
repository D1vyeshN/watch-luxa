'use client';

import Link from 'next/link';
import { CanAccess } from '@refinedev/core';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuditLogsTable } from '@/components/audit-logs/audit-logs-table';
import { AccessDenied } from '@/components/shared/access-denied';

export default function AuditLogsPage() {
  return (
    <CanAccess
      resource="audit-logs"
      action="list"
      fallback={<AccessDenied message="Only superadmins can view audit logs." />}
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
            <Link href="/settings">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Settings
            </Link>
          </Button>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            System
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Audit Logs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every successful change made through the admin: who, when, from where, and what was
            sent. Passwords and tokens are redacted. Read-only.
          </p>
        </div>

        <AuditLogsTable />
      </div>
    </CanAccess>
  );
}
