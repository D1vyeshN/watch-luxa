import Link from 'next/link';
import { Container } from '@/components/shared/container';
import { Section } from '@/components/shared/section';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ROUTES } from '@/constants/routes';
import type { FaqItem } from '@/constants/faq';

interface HomeFaqProps {
  title: string;
  description?: string;
  items: FaqItem[];
}

export function HomeFaq({ title, description, items }: HomeFaqProps) {
  return (
    <Section spacing="lg" background="default">
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <h2 className="heading-luxe text-3xl md:text-4xl lg:text-5xl">{title}</h2>
            {description && (
              <p className="mt-4 max-w-sm text-base text-ink-soft">{description}</p>
            )}
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
              <Link
                href={ROUTES.faq}
                className="border-b border-forest-900 py-1 text-xs uppercase tracking-[0.18em] text-forest-900 transition-colors hover:border-cream-700 hover:text-cream-700"
              >
                All questions
              </Link>
              <Link
                href={ROUTES.contact}
                className="border-b border-forest-900/30 py-1 text-xs uppercase tracking-[0.18em] text-forest-900 transition-colors hover:border-forest-900"
              >
                Contact us
              </Link>
            </div>
          </div>

          <Accordion
            type="single"
            collapsible
            defaultValue="faq-0"
            className="border-t border-forest-900/15 lg:col-span-8"
          >
            {items.map((item, i) => (
              <AccordionItem
                key={item.q}
                value={`faq-${i}`}
                className="border-b border-forest-900/15"
              >
                <AccordionTrigger className="py-6 font-serif text-xl font-normal text-forest-900 hover:no-underline md:text-2xl [&>svg]:size-5 [&>svg]:text-forest-900">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="max-w-2xl pb-6 text-base leading-relaxed text-ink-soft">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Container>
    </Section>
  );
}
