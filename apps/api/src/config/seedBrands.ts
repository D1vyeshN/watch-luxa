import { Brand } from '@models/brand.model';
import { logger } from './logger';
import { slugify } from '@utils/string';

const SYSTEM_BRANDS = [
  {
    name: 'Rolex',
    country: 'Switzerland',
    founded: 1905,
    featured: true,
    heritageStory: 'Founded in London and later moved to Geneva, Rolex has become synonymous with luxury and precision timekeeping.',
  },
  {
    name: 'Omega',
    country: 'Switzerland',
    founded: 1848,
    featured: true,
    heritageStory: 'Omega has been the official timekeeper of the Olympic Games and is famous for its Speedmaster chronograph, the first watch on the moon.',
  },
  {
    name: 'Tag Heuer',
    country: 'Switzerland',
    founded: 1860,
    featured: true,
    heritageStory: 'Known for its innovation in chronographs and strong ties to motorsports, TAG Heuer continues to push the boundaries of watchmaking.',
  },
  {
    name: 'Seiko',
    country: 'Japan',
    founded: 1881,
    featured: true,
    heritageStory: 'Seiko revolutionized the watch industry with quartz technology and continues to innovate with mechanical movements and craftsmanship.',
  },
  {
    name: 'Cartier',
    country: 'France',
    founded: 1847,
    featured: true,
    heritageStory: 'A pioneer in watch design, Cartier created iconic timepieces like the Tank and Santos, blending jewelry with horology.',
  },
  {
    name: 'Patek Philippe',
    country: 'Switzerland',
    founded: 1839,
    featured: true,
    heritageStory: 'One of the oldest and most prestigious watch manufacturers, Patek Philippe is renowned for its complicated timepieces and craftsmanship.',
  },
  {
    name: 'Audemars Piguet',
    country: 'Switzerland',
    founded: 1875,
    featured: true,
    heritageStory: 'Famous for the Royal Oak, Audemars Piguet has maintained independence and excellence in high-end watchmaking for over a century.',
  },
  {
    name: 'Breitling',
    country: 'Switzerland',
    founded: 1884,
    featured: true,
    heritageStory: 'Breitling has built its reputation on precision chronographs and strong connections to aviation.',
  },
];

export const seedSystemBrands = async () => {
  for (const brand of SYSTEM_BRANDS) {
    const slug = slugify(brand.name);
    const existing = await Brand.findOne({ slug });

    if (!existing) {
      await Brand.create({
        ...brand,
        slug,
        status: 'active',
      });
      logger.info(`🌱 Created system brand: ${brand.name}`);
    }
  }
  logger.info('✅ System brands seeded');
};
