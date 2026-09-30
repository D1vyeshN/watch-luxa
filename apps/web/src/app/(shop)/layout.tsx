import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { MobileMenu } from '@/components/layout/mobile-menu';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { SkipLink } from '@/components/shared/skip-link';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SkipLink />
      <SiteHeader />
      <main id="main-content" className="flex-1">{children}</main>
      <SiteFooter />

      {/* Global overlays */}
      <MobileMenu />
      <CartDrawer />
    </div>
  );
}
