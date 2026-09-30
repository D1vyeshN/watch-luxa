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
  title: 'Craftsmanship',
  description: 'The art and engineering behind exceptional timepieces.',
};

const STEPS = [
  {
    number: '01',
    title: 'The Movement',
    body: 'Every mechanical watch we carry begins with a caliber engineered to tolerance of under 1/1000 of a millimeter. Each component is measured, finished, and assembled by hand.',
  },
  {
    number: '02',
    title: 'The Case',
    body: 'Cases are milled from solid blocks of steel, titanium, gold, or platinum. Every angle is cut, every surface polished. The result is a housing that protects the movement for decades.',
  },
  {
    number: '03',
    title: 'The Dial',
    body: 'Dial work is one of the most demanding crafts in horology. Applied indices, sunray finishes, and enamel work are all done by hand, under magnification.',
  },
  {
    number: '04',
    title: 'The Assembly',
    body: 'Over 200 components are assembled into a working movement. No glue, no shortcuts. Every gear meshes, every jewel seats, every spring tension is measured.',
  },
  {
    number: '05',
    title: 'The Regulation',
    body: 'Every watch is regulated over multiple days, in multiple positions, to ensure it keeps time to within a few seconds per day.',
  },
  {
    number: '06',
    title: 'The Final Test',
    body: 'Before shipping, each piece undergoes water-resistance testing, accuracy testing, and a full visual inspection by a senior watchmaker.',
  },
];

export default function CraftsmanshipPage() {
  return (
    <>
      <PageHero
        overline="Craftsmanship"
        title="Made to Outlast"
        subtitle="A mechanical watch is a small feat of engineering. Made well, it will run for centuries. Here is what that takes."
      />

      <ProseSection size="wide">
        <div className="grid gap-x-12 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.number}>
              <p className="font-serif text-5xl text-cream-600 md:text-6xl">
                {step.number}
              </p>
              <h3 className="heading-luxe mt-4 text-xl md:text-2xl">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </ProseSection>

      <div className="relative aspect-[16/9] w-full bg-cream-200 md:aspect-[21/9]">
        <Image
          src="/images/craftsmanship-macro.jpg"
          alt="Movement macro detail"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <ProseSection>
        <ProseHeading>Why it matters</ProseHeading>
        <ProseParagraph>
          A well-made watch is one of the few objects you will own that can
          be passed down. It will not become obsolete. It will not stop
          working because its software is out of date. It will only grow
          more valuable with time.
        </ProseParagraph>
        <ProseParagraph>
          That is what we mean when we say &ldquo;made to outlast.&rdquo;
        </ProseParagraph>
      </ProseSection>
    </>
  );
}
