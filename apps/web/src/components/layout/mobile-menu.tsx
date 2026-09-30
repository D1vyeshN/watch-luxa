'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeMobileMenu } from '@/store/slices/uiSlice';
import { useGetCategoriesQuery } from '@/store/api/endpoints/categories';
import { ROUTES } from '@/constants/routes';

export function MobileMenu() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((s) => s.ui.isMobileMenuOpen);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const { data: categoriesResponse } = useGetCategoriesQuery();

  const categories = categoriesResponse?.data ?? [];

  const close = () => dispatch(closeMobileMenu());

  return (
    <Sheet open={isOpen} onOpenChange={close}>
      <SheetContent
        side="left"
        className="flex w-full flex-col gap-0 border-r-0 bg-cream-100 p-0 sm:max-w-md"
      >
        <SheetHeader className="flex flex-row items-center justify-between border-b border-forest-900/10 px-6 py-5">
          <SheetTitle className="font-serif text-2xl tracking-[0.25em] text-forest-900">
            LUXE
          </SheetTitle>
          <button onClick={close} aria-label="Close menu">
            <X className="h-5 w-5 text-forest-900" />
          </button>
        </SheetHeader>

        <nav className="flex-1 overflow-y-auto px-6 py-6">
          {/* Primary links */}
          <ul className="space-y-5">
            {[
              { label: 'New Arrivals', href: ROUTES.newArrivals },
              { label: 'Shop All', href: ROUTES.shop },
              { label: 'Wishlist', href: ROUTES.wishlist },
              { label: 'Collections', href: ROUTES.collections },
              { label: 'Journal', href: ROUTES.journal },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={close}
                  className="font-serif text-2xl text-forest-900 transition-colors hover:text-cream-600"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <Separator className="my-6 bg-forest-900/10" />

          {/* Categories */}
          <p className="label-luxe mb-4">Watches</p>
          <ul className="space-y-3">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={ROUTES.category(cat.slug)}
                  onClick={close}
                  className="text-sm text-ink-soft transition-colors hover:text-forest-900"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>

          <Separator className="my-6 bg-forest-900/10" />

          {/* Gender filters */}
          <ul className="space-y-3">
            <li>
              <Link
                href={`${ROUTES.shop}?gender=men`}
                onClick={close}
                className="text-sm text-ink-soft transition-colors hover:text-forest-900"
              >
                Men
              </Link>
            </li>
            <li>
              <Link
                href={`${ROUTES.shop}?gender=women`}
                onClick={close}
                className="text-sm text-ink-soft transition-colors hover:text-forest-900"
              >
                Women
              </Link>
            </li>
          </ul>
        </nav>

        {/* Footer actions */}
        <div className="border-t border-forest-900/10 bg-cream-50 px-6 py-5">
          {isAuthenticated ? (
            <Link
              href={ROUTES.account}
              onClick={close}
              className="block text-xs uppercase tracking-[0.18em] text-forest-900"
            >
              My Account
            </Link>
          ) : (
            <div className="flex gap-4">
              <Link
                href={ROUTES.login}
                onClick={close}
                className="text-xs uppercase tracking-[0.18em] text-forest-900"
              >
                Sign In
              </Link>
              <Link
                href={ROUTES.register}
                onClick={close}
                className="text-xs uppercase tracking-[0.18em] text-forest-900"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
