'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { NAV_GROUPS } from '@/constants/nav-config';

export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      {/* ─── Header: Logo ─── */}
      <SidebarHeader className="border-b border-sidebar-border">
        <Link
          href="/dashboard"
          className="flex items-center justify-center py-3"
        >
          <span
            className="font-serif tracking-[0.25em] text-cream-100 transition-all duration-300"
            style={{
              fontSize: isCollapsed ? 18 : 22,
              letterSpacing: isCollapsed ? '0.15em' : '0.25em',
            }}
          >
            {isCollapsed ? 'L' : 'LUXE'}
          </span>
        </Link>
      </SidebarHeader>

      {/* ─── Navigation groups ─── */}
      <SidebarContent>
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-[10px] font-medium uppercase tracking-[0.14em] text-sidebar-foreground/50">
              {group.title}
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.url ||
                    (item.url !== '/dashboard' &&
                      pathname.startsWith(item.url + '/'));

                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                      >
                        <Link href={item.url}>
                          <Icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* ─── Footer ─── */}
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-sidebar-foreground/40">
          {isCollapsed ? 'v1' : 'LUXE Admin v1.0'}
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
