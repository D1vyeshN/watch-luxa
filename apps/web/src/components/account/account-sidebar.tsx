'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Heart,
  MapPin,
  RotateCcw,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/useToast';

const LINKS = [
  { href: ROUTES.account, label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: ROUTES.accountOrders, label: 'Orders', icon: Package },
  { href: ROUTES.wishlist, label: 'Wishlist', icon: Heart },
  { href: ROUTES.accountAddresses, label: 'Addresses', icon: MapPin },
  { href: ROUTES.accountReturns, label: 'Returns', icon: RotateCcw },
];

export function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Signed out');
      router.replace(ROUTES.home);
    } catch {
      toast.error('Could not sign out');
    }
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    // Special case for wishlist - it's now at /wishlist not /account/wishlist
    if (href === ROUTES.wishlist) return pathname === ROUTES.wishlist;
    return pathname.startsWith(href);
  };

  return (
    <div className="space-y-8">
      {/* User info */}
      <div className="border-b border-forest-900/10 pb-6">
        <p className="text-xs uppercase tracking-[0.14em] text-ink-muted">
          Signed in as
        </p>
        <p className="mt-1 font-serif text-lg text-forest-900">
          {user?.name}
        </p>
        <p className="mt-0.5 truncate text-xs text-ink-muted">
          {user?.email}
        </p>
      </div>

      {/* Nav */}
      <nav>
        <ul className="space-y-1">
          {LINKS.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href, link.exact);

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors',
                    active
                      ? 'bg-forest-900 text-cream-100'
                      : 'text-ink-soft hover:bg-cream-200 hover:text-forest-900'
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="border-t border-forest-900/10 pt-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-ink-soft transition-colors hover:bg-cream-200 hover:text-forest-900"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.5} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
