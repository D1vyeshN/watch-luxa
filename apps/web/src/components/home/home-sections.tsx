import { FAQ_GROUPS, type FaqItem } from '@/constants/faq';
import type { Product } from '@/types/catalog';
import type { HomeData, HomeSection, ProductRailSection } from '@/types/home';
import { CategoryBento, resolveBentoTiles } from './category-bento';
import { ProductRail } from './product-rail';
import { MaisonSection } from './maison-section';
import { EditorialBanner } from './editorial-banner';
import { ServicesStagger } from './services-stagger';
import { HomeFaq } from './home-faq';

type Tone = 'default' | 'cream';

const ALL_FAQS = FAQ_GROUPS.flatMap((g) => g.items);

/** Products the API resolved for this rail (none for the static defaults) */
const railProducts = (section: ProductRailSection): Product[] => section.products ?? [];

const isFullBleed = (s: HomeSection) => s.type === 'editorial' && s.variant === 'immersive';

/**
 * Flat sections alternate cream tones so neighbours never merge; a full-bleed
 * image breaks the run, and the next flat section starts again from the base.
 */
function assignTones(sections: HomeSection[]): Tone[] {
  let next: Tone = 'default';
  return sections.map((s) => {
    if (isFullBleed(s)) {
      next = 'default';
      return 'default'; // unused: the image has no background
    }
    const tone = next;
    next = tone === 'default' ? 'cream' : 'default';
    return tone;
  });
}

/** Would this section render anything? Empty sections are skipped entirely */
function hasContent(section: HomeSection, data: HomeData): boolean {
  switch (section.type) {
    case 'categoryBento':
      return resolveBentoTiles(section.tiles, data.categories).length > 0;
    case 'productRail':
      return railProducts(section).length > 0;
    case 'faq':
      return section.questions.some((q) => ALL_FAQS.some((f) => f.q === q));
    default:
      return true;
  }
}

interface HomeSectionsProps {
  sections: HomeSection[];
  data: HomeData;
}

/** Renders the homepage below the hero from its section list */
export function HomeSections({ sections, data }: HomeSectionsProps) {
  const visible = sections.filter((s) => s.enabled && hasContent(s, data));
  const tones = assignTones(visible);

  return (
    <>
      {visible.map((section, i) => {
        const background = tones[i];
        switch (section.type) {
          case 'categoryBento':
            return (
              <CategoryBento
                key={section.id}
                title={section.title}
                description={section.description}
                tiles={resolveBentoTiles(section.tiles, data.categories)}
                background={background}
              />
            );

          case 'productRail':
            return (
              <ProductRail
                key={section.id}
                title={section.title}
                description={section.description}
                viewAll={section.viewAll}
                products={railProducts(section)}
                limit={section.limit}
                background={background}
              />
            );

          case 'maison':
            return (
              <MaisonSection
                key={section.id}
                headline={section.headline}
                body={section.body}
                imageUrl={section.imageUrl}
                imageAlt={section.imageAlt}
                pillars={section.pillars}
                cta={section.cta}
                background={background}
              />
            );

          case 'editorial':
            if (section.variant === 'immersive') {
              return (
                <EditorialBanner
                  key={section.id}
                  variant="immersive"
                  headline={section.headline}
                  body={section.body}
                  imageUrl={section.imageUrl}
                  imageAlt={section.imageAlt}
                  cta={section.cta}
                />
              );
            }
            return (
              <EditorialBanner
                key={section.id}
                variant="split"
                headline={section.headline}
                body={section.body}
                imageUrl={section.imageUrl}
                imageAlt={section.imageAlt}
                reverse={section.reverse}
                cta={section.cta}
                background={background}
              />
            );

          case 'services':
            return (
              <ServicesStagger
                key={section.id}
                title={section.title}
                description={section.description}
                backgroundImage={section.backgroundImage}
                services={section.services}
                background={background}
              />
            );

          case 'faq': {
            const items = section.questions
              .map((q) => ALL_FAQS.find((f) => f.q === q))
              .filter((f): f is FaqItem => Boolean(f));
            return (
              <HomeFaq
                key={section.id}
                title={section.title}
                description={section.description}
                items={items}
                background={background}
              />
            );
          }
        }
      })}
    </>
  );
}
