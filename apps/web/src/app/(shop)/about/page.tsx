import type { Metadata } from 'next';
import Image from 'next/image';
import { Container } from '@/components/shared/container';
import {
  PageHero,
  ProseSection,
  ProseHeading,
  ProseParagraph,
} from '@/components/content';

export const metadata: Metadata = {
  title: 'Our Story',
  description:
    'LUXE is a curated destination for exceptional timepieces, blending heritage with modern precision.',
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        overline="Our Story"
        title="Time, Refined."
        subtitle="LUXE exists for those who understand that a watch is not an accessory — it is a companion, an heirloom, and a record of the moments that shape a life."
        variant="forest"
      />

      <ProseSection>
        <ProseHeading>Founded on a simple belief</ProseHeading>
        <ProseParagraph>
          We believe exceptional timepieces deserve a home that treats them
          with the care they deserve. LUXE was built to be that home — a
          destination where collectors, first-time buyers, and the merely
          curious can find pieces selected for their craftsmanship,
          heritage, and character.
        </ProseParagraph>
        <ProseParagraph>
          Every watch in our collection has been chosen because it does
          something well — not because it is popular. We do not chase
          trends. We do not stock pieces that will be forgotten in five
          years. We stock pieces that will outlast us.
        </ProseParagraph>

        <ProseHeading>How we choose</ProseHeading>
        <ProseParagraph>
          Our curators look for three things: integrity of design, quality
          of movement, and depth of story. A watch must be honest about
          what it is. It must be engineered to last. And it must have a
          reason to exist.
        </ProseParagraph>
        <ProseParagraph>
          This is why our catalog is intentionally narrow. We would rather
          carry twenty great watches than two hundred forgettable ones.
        </ProseParagraph>
      </ProseSection>

      {/* Image band */}
      <div className="relative aspect-[16/9] w-full bg-cream-200 md:aspect-[21/9]">
        <Image
          src="/images/about-workshop.jpg"
          alt="Watchmaker's workshop"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <ProseSection>
        <ProseHeading>A promise on every order</ProseHeading>
        <ProseParagraph>
          Every piece is authenticated before it ships. Every order is
          insured. Every customer has fourteen days to decide whether the
          piece is right — and a lifetime of support if it is.
        </ProseParagraph>
        <ProseParagraph>
          If you are ever unsure, write to us. Our team will help you find
          the right watch, or tell you honestly when none of ours is.
        </ProseParagraph>
      </ProseSection>
    </>
  );
}
