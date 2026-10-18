'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ShoppingBag, User, Menu, Heart } from 'lucide-react';
import { Container } from '@/components/shared/container';
import { Badge } from '@/components/ui/badge';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { openCartDrawer, openMobileMenu } from '@/store/slices/uiSlice';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

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

  // Homepage: float transparently over the hero, then fade into the normal
  // solid bar while the first half of the hero scrolls away
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [solid, setSolid] = useState(false);
  const overlay = pathname === ROUTES.home;

  useEffect(() => {
    if (!overlay) return;
    // No hero (e.g. the "unable to reach the store" page) → solid straight away
    const hero = document.querySelector<HTMLElement>('[data-hero]');

    let frame = 0;
    const update = () => {
      frame = 0;
      const fadeOver = Math.max((hero?.offsetHeight ?? 0) / 2, 1);
      const progress = hero ? Math.min(Math.max(window.scrollY / fadeOver, 0), 1) : 1;
      headerRef.current?.style.setProperty('--nav-solid', progress.toFixed(3));
      setSolid(progress > 0.5);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    onScroll(); // first paint (also covers a reload mid-page)
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [overlay]);

  // Light text over the hero, brand green once the bar is solid
  const tone = overlay && !solid ? 'text-cream-100' : 'text-forest-900';

  return (
    <header
      ref={headerRef}
      className={cn(
        'top-0 z-40 border-b',
        overlay
          ? 'fixed inset-x-0'
          : 'sticky border-forest-900/10 bg-cream-100/95 backdrop-blur-sm'
      )}
      style={
        overlay
          ? {
              // --nav-solid: 0 at the top of the page → 1 once scrolled
              backgroundColor: 'rgb(249 246 239 / calc(var(--nav-solid, 0) * 0.95))',
              borderBottomColor: 'rgb(15 35 32 / calc(var(--nav-solid, 0) * 0.1))',
              backdropFilter: 'blur(calc(var(--nav-solid, 0) * 4px))',
            }
          : undefined
      }
    >
      {/* Soft shade so light text stays readable on bright hero images */}
      {overlay && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-forest-900/45 to-transparent"
          style={{ opacity: 'calc(1 - var(--nav-solid, 0))' }}
        />
      )}

      <Container className="flex h-20 items-center justify-between">
        {/* Left: Mobile menu button */}
        <button
          className="lg:hidden"
          onClick={() => dispatch(openMobileMenu())}
          aria-label="Open menu"
        >
          <Menu className={cn('h-5 w-5 transition-colors duration-500', tone)} />
        </button>

        {/* Center: Logo */}
        <Link
          href={ROUTES.home}
          className={cn('font-serif text-2xl tracking-[0.25em] transition-colors duration-500', tone)}
        >
          LUXE
        </Link>

        {/* Center: Desktop nav */}
        <nav className="hidden lg:flex gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-4 py-2 text-xs uppercase tracking-[0.18em] transition-colors duration-500 hover:text-cream-600',
                tone
              )}
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
            <Search className={cn('h-5 w-5 transition-colors duration-500', tone)} />
          </Link>

          <Link
            href={ROUTES.wishlist}
            aria-label="Wishlist"
            className="relative transition-colors hover:text-cream-600"
          >
            <Heart className={cn('h-5 w-5 transition-colors duration-500', tone)} />
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
            <User className={cn('h-5 w-5 transition-colors duration-500', tone)} />
          </Link>

          <button
            onClick={() => dispatch(openCartDrawer())}
            aria-label="Open cart"
            className="relative cursor-pointer transition-colors hover:text-cream-600"
          >
            <ShoppingBag className={cn('h-5 w-5 transition-colors duration-500', tone)} />
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
