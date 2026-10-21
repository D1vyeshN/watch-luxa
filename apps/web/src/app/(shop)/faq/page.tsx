import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/shared/container';
import { PageHero } from '@/components/content';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ROUTES } from '@/constants/routes';
import { FAQ_GROUPS } from '@/constants/faq';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Answers to commonly asked questions.',
};

export default function FAQPage() {
  return (
    <>
      <PageHero
        overline="Help"
        title="Frequently Asked Questions"
        subtitle="Answers to the most common questions about ordering, shipping, and caring for your timepiece."
        align="center"
      />

      <Container className="py-12 md:py-20">
        <div className="mx-auto max-w-3xl space-y-12">
          {FAQ_GROUPS.map((group) => (
            <div key={group.category}>
              <h2 className="heading-luxe mb-6 text-2xl">
                {group.category}
              </h2>

              <Accordion
                type="single"
                collapsible
                className="border-t border-forest-900/10"
              >
                {group.items.map((item, i) => (
                  <AccordionItem
                    key={i}
                    value={`${group.category}-${i}`}
                    className="border-b border-forest-900/10"
                  >
                    <AccordionTrigger className="py-5 text-left text-base font-medium text-forest-900 hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 text-sm leading-relaxed text-ink-soft">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}

          {/* Still need help */}
          <div className="border border-forest-900/10 bg-cream-100 p-8 text-center">
            <h3 className="heading-luxe text-xl">Still need help?</h3>
            <p className="mt-3 text-sm text-ink-soft">
              Our team responds within 24 hours.
            </p>
            <Link
              href={ROUTES.contact}
              className="mt-6 inline-flex items-center justify-center rounded-sm bg-forest-900 px-6 py-3 text-xs uppercase tracking-[0.18em] text-cream-100 hover:bg-forest-800"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
}
