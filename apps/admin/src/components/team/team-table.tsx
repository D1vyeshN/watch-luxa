'use client';

import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useTable } from '@refinedev/react-table';
import { useCustomMutation, useInvalidate } from '@refinedev/core';
import { MoreHorizontal, Power, PowerOff, Shield, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/refine-ui/data-table/data-table';
import { CustomerAvatar } from '@/components/customers/customer-avatar';
import { tokenStorage } from '@/lib/storage/tokenStorage';
import { formatDateTime } from '@/lib/format/currency';
import { cn } from '@/lib/utils';
import type { TeamMember } from '@/types/team';

export function TeamTable() {
  const [toToggle, setToToggle] = useState<TeamMember | null>(null);
  const { mutate: updateAdmin, mutation } = useCustomMutation();
  const invalidate = useInvalidate();
  const currentUserId = tokenStorage.getUser()?._id;

  const handleToggle = () => {
    if (!toToggle) return;
    const member = toToggle;
    updateAdmin(
      {
        url: `/superadmin/admins/${member.id}`,
        method: 'patch',
        values: { isActive: !member.isActive },
        errorNotification: false,
      },
      {
        onSuccess: () => {
          toast.success(
            member.isActive ? `${member.name} deactivated` : `${member.name} reactivated`
          );
          // Custom mutations don't invalidate lists by themselves
          invalidate({ resource: 'team', invalidates: ['list'] });
        },
        onError: (err) => toast.error(err.message || 'Failed to update admin'),
        onSettled: () => setToToggle(null),
      }
    );
  };

  const columns = useMemo<ColumnDef<TeamMember>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'name',
        header: 'Name',
        enableSorting: false,
        cell: ({ row }) => {
          const member = row.original;
          return (
            <div className="flex items-center gap-3">
              <CustomerAvatar name={member.name} className="h-9 w-9 text-xs" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {member.name}
                  {member.id === currentUserId && (
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">(you)</span>
                  )}
                </p>
                <p className="truncate text-xs text-muted-foreground">{member.email}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: 'role',
        accessorKey: 'role',
        header: 'Role',
        enableSorting: false,
        cell: ({ getValue }) => {
          const isSuper = getValue<TeamMember['role']>() === 'superadmin';
          const Icon = isSuper ? ShieldCheck : Shield;
          return (
            <Badge
              variant="outline"
              className={cn(
                'border-transparent',
                isSuper
                  ? 'bg-cream-600/20 text-forest-900 dark:text-cream-600'
                  : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
              )}
            >
              <Icon className="mr-1 h-3 w-3" aria-hidden />
              {isSuper ? 'Superadmin' : 'Admin'}
            </Badge>
          );
        },
      },
      {
        id: 'isActive',
        accessorKey: 'isActive',
        header: 'Status',
        enableSorting: false,
        cell: ({ getValue }) => (
          <Badge
            variant="outline"
            className={
              getValue<boolean>()
                ? 'border-transparent bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400'
                : 'border-transparent bg-muted text-muted-foreground'
            }
          >
            {getValue<boolean>() ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
      {
        id: 'lastLoginAt',
        accessorKey: 'lastLoginAt',
        header: 'Last Login',
        enableSorting: false,
        cell: ({ getValue }) => {
          const v = getValue<string | undefined>();
          return (
            <span className="text-xs text-muted-foreground">{v ? formatDateTime(v) : 'Never'}</span>
          );
        },
      },
      {
        id: 'createdAt',
        accessorKey: 'createdAt',
        header: 'Added',
        enableSorting: false,
        cell: ({ getValue }) => (
          <span className="text-xs text-muted-foreground">{formatDateTime(getValue<string>())}</span>
        ),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        size: 88,
        cell: ({ row }) => {
          const member = row.original;
          // The API refuses both; don't offer them
          if (member.role === 'superadmin' || member.id === currentUserId) {
            return (
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Protected
              </span>
            );
          }
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu for {member.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setToToggle(member)}>
                  {member.isActive ? (
                    <>
                      <PowerOff className="mr-2 h-4 w-4 text-destructive" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Power className="mr-2 h-4 w-4 text-green-600" />
                      Reactivate
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [currentUserId]
  );

  const table = useTable<TeamMember>({
    columns,
    refineCoreProps: {
      resource: 'team',
      pagination: { mode: 'server', currentPage: 1, pageSize: 20 },
      sorters: { initial: [{ field: 'createdAt', order: 'desc' }] },
      filters: { mode: 'server' },
    },
  });

  const tableQuery = table.refineCore.tableQuery;

  if (tableQuery.isError) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Failed to load team members. Is the backend running?
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border border-border bg-card">
        <DataTable table={table} />
      </div>

      <Dialog
        open={toToggle !== null}
        onOpenChange={(open) => !open && !mutation.isPending && setToToggle(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {toToggle?.isActive ? `Deactivate ${toToggle.name}?` : `Reactivate ${toToggle?.name}?`}
            </DialogTitle>
            <DialogDescription>
              {toToggle?.isActive
                ? 'They are signed out and lose admin access immediately. You can reactivate them later.'
                : 'They can sign in to the admin again with their existing password.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setToToggle(null)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant={toToggle?.isActive ? 'destructive' : 'default'}
              onClick={handleToggle}
              disabled={mutation.isPending}
            >
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {toToggle?.isActive ? 'Deactivate' : 'Reactivate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
