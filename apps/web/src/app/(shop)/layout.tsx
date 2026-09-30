import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { MobileMenu } from '@/components/layout/mobile-menu';
import { CartDrawer } from '@/components/cart/cart-drawer';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />

      {/* Global overlays */}
      <MobileMenu />
      <CartDrawer />
    </div>
  );
}
