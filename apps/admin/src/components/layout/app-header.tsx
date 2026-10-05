'use client';

import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from './user-menu';
import { AppBreadcrumbs } from './app-breadcrumbs';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {/* Left: sidebar toggle + breadcrumbs */}
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-5" />
      <div className="hidden flex-1 md:block">
        <AppBreadcrumbs />
      </div>
      <div className="flex-1 md:hidden" />

      {/* Right: theme + user */}
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
