import type { Metadata } from 'next';
import {
  PageHero,
  ProseSection,
  ProseHeading,
  ProseParagraph,
  ProseList,
} from '@/components/content';

export const metadata: Metadata = {
  title: 'Warranty & Care',
  description: 'What is covered, how to care for your watch, and where to get it serviced.',
};

export default function WarrantyPage() {
  return (
    <>
      <PageHero
        overline="Support"
        title="Warranty & Care"
        subtitle="A well-maintained watch will serve you for decades. Here is what is covered, and how to keep it running."
      />

      <ProseSection>
        <ProseHeading>What is covered</ProseHeading>
        <ProseParagraph>
          Every new watch includes the manufacturer's warranty, typically
          2-5 years depending on the brand. This covers:
        </ProseParagraph>
        <ProseList
          items={[
            'Manufacturing defects in movement or case',
            'Accuracy issues beyond manufacturer tolerance',
            'Water resistance failure caused by defective seals',
          ]}
        />

        <ProseHeading>What is not covered</ProseHeading>
        <ProseList
          items={[
            'Accidental damage (drops, impact, scratches)',
            'Water damage from submerging beyond the rated depth',
            'Normal wear to straps, bracelets, or crystals',
            'Damage from unauthorised servicing or repairs',
          ]}
        />

        <ProseHeading>Daily care</ProseHeading>
        <ProseList
          items={[
            'Wipe with a soft cloth after wearing to remove sweat and oils',
            'Avoid magnetic fields (speakers, laptops, phones)',
            'Keep leather straps away from water',
            'Store in the original box or a watch case',
          ]}
        />

        <ProseHeading>Servicing</ProseHeading>
        <ProseParagraph>
          Mechanical watches should be serviced every 3-5 years by a
          certified watchmaker. This includes cleaning, re-lubrication,
          and seal replacement. Skipping service is the fastest way to
          damage a movement.
        </ProseParagraph>

        <ProseHeading>Contact us for service</ProseHeading>
        <ProseParagraph>
          Write to hello@luxe.com with your order number and a description
          of the issue. We will coordinate service with the manufacturer
          or an authorised centre.
        </ProseParagraph>
      </ProseSection>
    </>
  );
}
