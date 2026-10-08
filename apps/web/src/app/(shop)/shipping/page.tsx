import type { Metadata } from 'next';
import {
  PageHero,
  ProseSection,
  ProseHeading,
  ProseParagraph,
  ProseList,
} from '@/components/content';
import { getStoreSettings } from '@/lib/api/store-settings';
import { formatPrice } from '@/lib/format/price';

export const metadata: Metadata = {
  title: 'Shipping',
  description: 'Shipping rates, timelines, and policies.',
};

export default async function ShippingPage() {
  // Same values checkout charges — editable in admin Settings
  const { freeShippingThreshold, flatShippingFee } = await getStoreSettings();
  const threshold = formatPrice(freeShippingThreshold);

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
            ...(freeShippingThreshold === 0
              ? ['Free insured shipping on every order']
              : [
                  `Free insured shipping on orders of ${threshold} or more`,
                  `Flat ${formatPrice(flatShippingFee)} shipping fee on orders below ${threshold}`,
                ]),
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
