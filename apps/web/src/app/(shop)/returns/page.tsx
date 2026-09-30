import type { Metadata } from 'next';
import Link from 'next/link';
import {
  PageHero,
  ProseSection,
  ProseHeading,
  ProseParagraph,
  ProseList,
} from '@/components/content';
import { ROUTES } from '@/constants/routes';

export const metadata: Metadata = {
  title: 'Returns',
  description: 'How to return a piece, and what is covered.',
};

export default function ReturnsPage() {
  return (
    <>
      <PageHero
        overline="Support"
        title="Returns"
        subtitle="You have 14 days from delivery to return unworn pieces in original packaging."
      />

      <ProseSection>
        <ProseHeading>Eligibility</ProseHeading>
        <ProseList
          items={[
            'Return requested within 14 days of delivery',
            'Piece is unworn and in original condition',
            'Original packaging, box, and papers included',
            'Security tags intact (where applicable)',
          ]}
        />

        <ProseHeading>What is not eligible</ProseHeading>
        <ProseList
          items={[
            'Custom, engraved, or personalised pieces',
            'Pieces showing signs of wear or damage',
            'Returns requested after 14 days',
          ]}
        />

        <ProseHeading>How to start a return</ProseHeading>
        <ProseParagraph>
          Sign in to your account, go to the order you wish to return, and
          select &ldquo;Request Return&rdquo;. You will need to provide a reason and
          upload photos of the piece.
        </ProseParagraph>

        <ProseParagraph>
          Once approved, we will send you a return shipping address. You
          cover return shipping unless the piece arrived damaged or is
          not as described.
        </ProseParagraph>

        <ProseHeading>Refunds</ProseHeading>
        <ProseParagraph>
          Refunds are processed within 5 business days of receiving and
          inspecting the returned piece. Refunds are issued to the
          original payment method.
        </ProseParagraph>
      </ProseSection>

      {/* CTA */}
      <div className="border-t border-forest-900/10 bg-cream-200">
        <div className="container mx-auto px-6 py-12 text-center md:px-10 md:py-16">
          <h3 className="heading-luxe text-2xl">
            Ready to start a return?
          </h3>
          <p className="mt-3 text-sm text-ink-soft">
            Sign in to view your orders and request a return.
          </p>
          <Link
            href={ROUTES.accountOrders}
            className="mt-6 inline-flex items-center justify-center rounded-sm bg-forest-900 px-6 py-3 text-xs uppercase tracking-[0.18em] text-cream-100 hover:bg-forest-800"
          >
            View My Orders
          </Link>
        </div>
      </div>
    </>
  );
}
