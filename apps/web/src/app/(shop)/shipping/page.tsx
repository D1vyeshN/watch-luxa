import type { Metadata } from 'next';
import {
  PageHero,
  ProseSection,
  ProseHeading,
  ProseParagraph,
  ProseList,
} from '@/components/content';

export const metadata: Metadata = {
  title: 'Shipping',
  description: 'Shipping rates, timelines, and policies.',
};

export default function ShippingPage() {
  return (
    <>
      <PageHero
        overline="Support"
        title="Shipping"
        subtitle="Every order is insured and requires a signature on delivery."
      />

      <ProseSection>
        <ProseHeading>Domestic (India)</ProseHeading>
        <ProseList
          items={[
            'Free insured shipping on orders above ₹50,000',
            'Flat ₹500 shipping fee on orders below ₹50,000',
            'Dispatched within 2 business days',
            'Delivered in 3-5 business days',
          ]}
        />

        <ProseHeading>International</ProseHeading>
        <ProseList
          items={[
            'Shipping rates calculated at checkout by destination',
            'Dispatched within 2 business days',
            'Delivered in 5-10 business days',
            'Duties and taxes are the responsibility of the recipient',
          ]}
        />

        <ProseHeading>Insurance</ProseHeading>
        <ProseParagraph>
          Every order is fully insured against loss and damage during
          transit at no additional cost. If your package is lost or
          damaged, contact us immediately.
        </ProseParagraph>

        <ProseHeading>Tracking</ProseHeading>
        <ProseParagraph>
          Once dispatched, you will receive a tracking number by email.
          You can also track your order on our site.
        </ProseParagraph>
      </ProseSection>
    </>
  );
}
