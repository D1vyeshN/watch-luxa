// Stock imagery for DEFAULT_HOME_SECTIONS (constants/home-sections.ts), the
// storefront's fallback when the API serves no sections. Live homepage images
// are uploaded in admin → Homepage → Sections; the API ships its own copy of
// these defaults (apps/api/src/models/homepageSections.ts).

const unsplash = (id: string, w = 1600) => `https://images.unsplash.com/photo-${id}?w=${w}&q=80`;

/** Bento tiles, keyed by category slug. Categories with their own image use that instead. */
export const CATEGORY_ART: Record<string, string> = {
  'dress-watches': unsplash('1524592094714-0f0654e20314'),
  'dive-watches': unsplash('1547996160-81dfa63595aa'),
  'pilot-watches': unsplash('1548171915-e79a380a2a4b'),
  'gmt-watches': unsplash('1587836374828-4dbafa94cf0e', 2000),
  'racing-watches': unsplash('1542496658-e33a6d0d50f6'),
  'field-watches': unsplash('1522312346375-d1a52e2b99b3'),
  'skeleton-watches': unsplash('1612817159949-195b6eb9e31a', 2000),
};

/** Categories shown in the bento grid, in tile order (first = the large tile) */
export const BENTO_CATEGORY_SLUGS = Object.keys(CATEGORY_ART);

export const HOME_ART = {
  maison: unsplash('1594534475808-b18fc33b045e', 1200),
  editorial: unsplash('1539874754764-5a96559165b0', 2000),
  services: unsplash('1623091558965-2a339b98698f', 2000),
};
