import type { Metadata } from 'next';
import {
  PageHero,
  ProseSection,
  ProseHeading,
  ProseParagraph,
  ProseList,
} from '@/components/content';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How we handle your data.',
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        overline="Legal"
        title="Privacy Policy"
        subtitle="Last updated: 1 October 2026"
        align="center"
      />

      <ProseSection>
        <ProseHeading>What we collect</ProseHeading>
        <ProseList
          items={[
            'Account information: name, email, phone, password (hashed)',
            'Order information: shipping address, order history, payment status',
            'Browsing information: pages viewed, products viewed, referrer',
            'Device information: browser, device type, IP address',
          ]}
        />

        <ProseHeading>How we use it</ProseHeading>
        <ProseList
          items={[
            'To process orders and provide customer support',
            'To send transactional emails (order confirmations, shipping updates)',
            'To improve our store and product selection',
            'To detect fraud and prevent abuse',
          ]}
        />

        <ProseHeading>What we do not do</ProseHeading>
        <ProseList
          items={[
            'We do not sell your data to third parties',
            'We do not share your payment details with anyone',
            'We do not track you across other websites without consent',
          ]}
        />

        <ProseHeading>Payment data</ProseHeading>
        <ProseParagraph>
          All payments are processed by PCI-DSS certified gateways
          (Razorpay, Stripe). We never see or store your card details.
        </ProseParagraph>

        <ProseHeading>Your rights</ProseHeading>
        <ProseParagraph>
          You may request a copy of your data, or ask us to delete it, at
          any time. Write to privacy@luxe.com.
        </ProseParagraph>
      </ProseSection>
    </>
  );
}
