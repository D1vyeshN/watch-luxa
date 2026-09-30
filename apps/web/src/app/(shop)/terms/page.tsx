import type { Metadata } from 'next';
import {
  PageHero,
  ProseSection,
  ProseHeading,
  ProseParagraph,
} from '@/components/content';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms governing use of LUXE.',
};

export default function TermsPage() {
  return (
    <>
      <PageHero
        overline="Legal"
        title="Terms of Service"
        subtitle="Last updated: 1 October 2026"
        align="center"
      />

      <ProseSection>
        <ProseHeading>Agreement</ProseHeading>
        <ProseParagraph>
          By using the LUXE website and placing an order, you agree to
          these terms. If you do not agree, please do not use the site.
        </ProseParagraph>

        <ProseHeading>Orders</ProseHeading>
        <ProseParagraph>
          All orders are subject to availability. We reserve the right to
          cancel any order for any reason, including pricing errors or
          suspected fraud.
        </ProseParagraph>

        <ProseHeading>Pricing</ProseHeading>
        <ProseParagraph>
          Prices are displayed in Indian Rupees (INR) and include GST where
          applicable. Shipping is calculated at checkout.
        </ProseParagraph>

        <ProseHeading>Returns</ProseHeading>
        <ProseParagraph>
          You have 14 days from delivery to return unworn pieces in
          original packaging. Custom or engraved pieces are final sale.
        </ProseParagraph>

        <ProseHeading>Intellectual property</ProseHeading>
        <ProseParagraph>
          All content on this site — including images, text, and logos — is
          owned by LUXE or its licensors and may not be reproduced without
          permission.
        </ProseParagraph>

        <ProseHeading>Limitation of liability</ProseHeading>
        <ProseParagraph>
          LUXE is not liable for indirect, incidental, or consequential
          damages arising from use of the site or products purchased
          through it.
        </ProseParagraph>

        <ProseHeading>Changes</ProseHeading>
        <ProseParagraph>
          We may update these terms at any time. The current version will
          always be available on this page.
        </ProseParagraph>
      </ProseSection>
    </>
  );
}
