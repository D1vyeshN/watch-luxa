'use client';

import { useRouter } from 'next/navigation';
import { useGetIdentity, useLogout } from '@refinedev/core';
import {
  User as UserIcon,
  Settings,
  LogOut,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Identity {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'superadmin';
}

export function UserMenu() {
  const router = useRouter();
  const { data: user } = useGetIdentity<Identity>();
  const { mutate: logout, isPending } = useLogout();

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'A';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-3 rounded-md px-2 py-1.5 outline-none transition-colors hover:bg-accent focus-visible:bg-accent">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-forest-900 text-xs font-medium text-cream-100 dark:bg-cream-600 dark:text-forest-900">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="hidden flex-col items-start leading-tight md:flex">
          <span className="text-xs font-medium">{user?.name || 'Admin'}</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {user?.role || 'admin'}
          </span>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-forest-900 text-xs font-medium text-cream-100 dark:bg-cream-600 dark:text-forest-900">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {user?.name || 'Admin'}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>
          <Badge
            variant={user?.role === 'superadmin' ? 'default' : 'secondary'}
            className="w-fit text-[10px]"
          >
            {user?.role}
          </Badge>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => router.push('/settings')}
            className="cursor-pointer"
          >
            <UserIcon className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push('/settings')}
            className="cursor-pointer"
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => logout()}
          disabled={isPending}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isPending ? 'Signing out…' : 'Sign out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
