import Link from 'next/link';
import { Container } from '@/components/shared/container';
import { Separator } from '@/components/ui/separator';
import { ROUTES } from '@/constants/routes';

const FOOTER_LINKS = {
  shop: [
    { label: 'New Arrivals', href: ROUTES.newArrivals },
    { label: 'All Watches', href: ROUTES.shop },
    { label: 'Collections', href: ROUTES.collections },
    { label: 'Brands', href: ROUTES.brands },
  ],
  support: [
    { label: 'Contact', href: ROUTES.contact },
    { label: 'FAQ', href: ROUTES.faq },
    { label: 'Warranty & Care', href: ROUTES.warranty },
    { label: 'Returns', href: ROUTES.returns },
    { label: 'Private Viewing', href: ROUTES.privateViewing },
  ],
  company: [
    { label: 'Our Story', href: ROUTES.about },
    { label: 'Craftsmanship', href: ROUTES.craftsmanship },
    { label: 'Journal', href: ROUTES.journal },
    { label: 'Stores', href: ROUTES.stores },
  ],
  legal: [
    { label: 'Privacy', href: ROUTES.privacy },
    { label: 'Terms', href: ROUTES.terms },
    { label: 'Shipping', href: ROUTES.shipping },
  ],
};

export function SiteFooter() {
  return (
    <footer className="bg-forest-900 text-cream-200">
      <Container className="py-16 md:py-20">
        {/* Top: brand + 4 columns */}
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          {/* Brand */}
          <div className="col-span-2">
            <Link
              href={ROUTES.home}
              className="font-serif text-2xl tracking-[0.25em] text-cream-100"
            >
              LUXE
            </Link>
            <p className="mt-4 max-w-xs text-sm text-cream-200/70">
              Timepieces for those who measure moments, not minutes.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="label-luxe mb-4 text-cream-600">Shop</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream-200/80 transition-colors hover:text-cream-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="label-luxe mb-4 text-cream-600">Support</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream-200/80 transition-colors hover:text-cream-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="label-luxe mb-4 text-cream-600">Company</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream-200/80 transition-colors hover:text-cream-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="label-luxe mb-4 text-cream-600">Newsletter</h4>
            <p className="text-sm text-cream-200/70">
              Stories, new arrivals, and private events.
            </p>
            <p className="mt-4 text-xs text-cream-200/50">
              Coming soon — subscribe form
            </p>
          </div>
        </div>

        <Separator className="my-10 bg-cream-200/10" />

        {/* Bottom: copyright + legal */}
        <div className="flex flex-col items-center justify-between gap-4 text-xs text-cream-200/60 md:flex-row">
          <p>© {new Date().getFullYear()} LUXE. All rights reserved.</p>

          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {FOOTER_LINKS.legal.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-colors hover:text-cream-100"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
