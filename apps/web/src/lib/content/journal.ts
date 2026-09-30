export interface JournalPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: number;
  publishedAt: string;
  image: string;
  author: string;
  content: string[];
}

export const JOURNAL_POSTS: JournalPost[] = [
  {
    slug: 'the-art-of-the-movement',
    title: 'The Art of the Movement',
    excerpt:
      'Inside the intricate world of mechanical calibers — why a hundred tiny parts still beat quartz.',
    category: 'Craftsmanship',
    readTime: 6,
    publishedAt: '2026-08-15',
    image: '/images/journal-1.jpg',
    author: 'LUXE Editorial',
    content: [
      'A mechanical watch movement is one of the last objects still made the way it was made two hundred years ago. Precision cutting, hand finishing, and above all — patience.',
      'Inside a typical Swiss caliber, more than 200 components work in concert. Each jewel is set by hand. Each bridge is polished. Each gear tooth is measured to the micron.',
      'The result is not merely a timekeeping device. It is a small mechanical heart that beats on your wrist — powered by nothing more than the movement of your arm or a few turns of the crown.',
      'This is why a mechanical watch lasts generations. This is why it is worth caring for.',
    ],
  },
  {
    slug: 'understanding-water-resistance',
    title: 'Understanding Water Resistance',
    excerpt:
      'What do 50m, 100m, and 300m really mean? A practical guide to keeping your watch safe.',
    category: 'Guides',
    readTime: 4,
    publishedAt: '2026-08-08',
    image: '/images/journal-2.jpg',
    author: 'LUXE Editorial',
    content: [
      'Water resistance ratings on watches are routinely misunderstood. A watch rated to 30 meters is not intended for swimming. A watch rated to 300 meters is not meant for diving at 300 meters.',
      'The rating is based on static pressure testing, not dynamic water activity. Splashing, swimming, and diving all exert far more pressure than the depth rating suggests.',
      'As a rule: 30m is splash-resistant. 50m is safe for swimming. 100m is safe for snorkeling. 200m+ is safe for diving.',
      'Always ensure the crown is fully screwed down before water contact. And never operate the crown or pushers while the watch is wet.',
    ],
  },
  {
    slug: 'why-heritage-matters',
    title: 'Why Heritage Matters',
    excerpt:
      'The stories behind the most iconic watches, and why they still hold value today.',
    category: 'Culture',
    readTime: 5,
    publishedAt: '2026-08-01',
    image: '/images/journal-3.jpg',
    author: 'LUXE Editorial',
    content: [
      'Every iconic watch has a story. A dive watch developed for naval officers. A chronograph designed for racing drivers. A pilot\'s watch that flew across oceans.',
      'The stories are not marketing. They are the reason the designs endure. Every detail was engineered for a purpose, and those purposes shaped the aesthetics.',
      'When you wear a piece with heritage, you are wearing a solution to a real problem. That is why it looks the way it does. That is why it still works.',
    ],
  },
  {
    slug: 'watch-care-basics',
    title: 'Watch Care Basics',
    excerpt:
      'Simple habits that will keep your timepiece accurate for decades.',
    category: 'Guides',
    readTime: 3,
    publishedAt: '2026-07-25',
    image: '/images/journal-4.jpg',
    author: 'LUXE Editorial',
    content: [
      'A luxury watch is a mechanical object, not a fragile one. But it benefits from a few simple habits.',
      'Wipe it with a soft cloth after wearing. Avoid magnets — speakers, laptops, phones. Keep it away from prolonged direct sunlight.',
      'For automatic watches, wear them regularly or use a watch winder. For quartz, replace the battery every 2-3 years before it leaks.',
      'Every 3-5 years, have it serviced by a certified watchmaker. This is not optional. It is what keeps the movement accurate and the seals watertight.',
    ],
  },
];

export function getPostBySlug(slug: string): JournalPost | undefined {
  return JOURNAL_POSTS.find((p) => p.slug === slug);
}
