import Link from 'next/link';
import { Container } from '@/components/shared/container';
import { Separator } from '@/components/ui/separator';
import { NewsletterForm } from '@/components/shared/newsletter-form';
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

            <div className="mt-8 max-w-sm">
              <p className="font-serif text-xl text-cream-100">New arrivals, first</p>
              <p className="mt-1 text-sm text-cream-200/70">
                A short letter when a remarkable piece arrives.
              </p>
              <NewsletterForm source="footer" tone="dark" className="mt-4" />
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="label-luxe mb-4 text-cream-600!">Shop</h4>
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
            <h4 className="label-luxe mb-4 text-cream-600!">Support</h4>
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
            <h4 className="label-luxe mb-4 text-cream-600!">Company</h4>
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

          {/* Concierge */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="label-luxe mb-4 text-cream-600!">Concierge</h4>
            <p className="text-sm text-cream-200/70">
              See a piece in person with a LUXE specialist.
            </p>
            <Link
              href={ROUTES.privateViewing}
              className="mt-4 inline-block border-b border-cream-600 py-1 text-xs uppercase tracking-[0.18em] text-cream-600 transition-colors hover:border-cream-400 hover:text-cream-400"
            >
              Book a viewing
            </Link>
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

      {/* Oversized wordmark, cropped by the page edge */}
      <div aria-hidden className="select-none overflow-hidden">
        <p className="-mb-[0.18em] text-center font-serif text-[27vw] leading-none tracking-[0.12em] text-cream-100/[0.07]">
          LUXE
        </p>
      </div>
    </footer>
  );
}
