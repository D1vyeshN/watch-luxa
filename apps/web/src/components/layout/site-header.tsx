'use client';

import Link from 'next/link';
import { Search, ShoppingBag, User, Menu, Heart } from 'lucide-react';
import { Container } from '@/components/shared/container';
import { Badge } from '@/components/ui/badge';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { openCartDrawer, openMobileMenu } from '@/store/slices/uiSlice';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { ROUTES } from '@/constants/routes';

const NAV_LINKS = [
  { label: 'New Arrivals', href: ROUTES.newArrivals },
  { label: 'Men', href: `${ROUTES.shop}?gender=men` },
  { label: 'Women', href: `${ROUTES.shop}?gender=women` },
  { label: 'Collections', href: ROUTES.collections },
  { label: 'Journal', href: ROUTES.journal },
];

export function SiteHeader() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const { getCartCount } = useCart();
  const { count: wishlistCount } = useWishlist();

  const itemCount = getCartCount();

  return (
    <header className="sticky top-0 z-40 border-b border-forest-900/10 bg-cream-100/95 backdrop-blur-sm">
      <Container className="flex h-20 items-center justify-between">
        {/* Left: Mobile menu button */}
        <button
          className="lg:hidden"
          onClick={() => dispatch(openMobileMenu())}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-forest-900" />
        </button>

        {/* Center: Logo */}
        <Link
          href={ROUTES.home}
          className="font-serif text-2xl tracking-[0.25em] text-forest-900"
        >
          LUXE
        </Link>

        {/* Center: Desktop nav */}
        <nav className="hidden lg:flex gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-xs uppercase tracking-[0.18em] text-forest-900 transition-colors hover:text-cream-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.search}
            aria-label="Search"
            className="transition-colors hover:text-cream-600"
          >
            <Search className="h-5 w-5 text-forest-900" />
          </Link>

          <Link
            href={ROUTES.wishlist}
            aria-label="Wishlist"
            className="relative transition-colors hover:text-cream-600"
          >
            <Heart className="h-5 w-5 text-forest-900" />
            {wishlistCount > 0 && (
              <Badge className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-cream-600 p-0 text-[10px] font-medium text-forest-900 hover:bg-cream-600">
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </Badge>
            )}
          </Link>

          <Link
            href={isAuthenticated ? ROUTES.account : ROUTES.login}
            aria-label="Account"
            className="hidden transition-colors hover:text-cream-600 sm:block"
          >
            <User className="h-5 w-5 text-forest-900" />
          </Link>

          <button
            onClick={() => dispatch(openCartDrawer())}
            aria-label="Open cart"
            className="relative cursor-pointer transition-colors hover:text-cream-600"
          >
            <ShoppingBag className="h-5 w-5 text-forest-900" />
            {itemCount > 0 && (
              <Badge className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-cream-600 p-0 text-[10px] font-medium text-forest-900 hover:bg-cream-600">
                {itemCount > 99 ? '99+' : itemCount}
              </Badge>
            )}
          </button>
        </div>
      </Container>
    </header>
  );
}
