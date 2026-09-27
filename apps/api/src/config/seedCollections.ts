import { Collection } from '@models/collection.model';
import { logger } from './logger';
import { slugify } from '@utils/string';

const SYSTEM_COLLECTIONS = [
  {
    name: 'New Arrivals',
    description: 'The latest additions to our collection',
    featured: true,
    displayOrder: 1,
  },
  {
    name: 'Heritage Classic',
    description: 'Timeless pieces with enduring design',
    featured: true,
    displayOrder: 2,
  },
  {
    name: 'Sport & Diving',
    description: 'Engineered for adventure and precision',
    featured: true,
    displayOrder: 3,
  },
  {
    name: 'Limited Editions',
    description: 'Rare and exclusive timepieces',
    featured: true,
    displayOrder: 4,
  },
];

export const seedSystemCollections = async () => {
  for (const col of SYSTEM_COLLECTIONS) {
    const slug = slugify(col.name);
    const existing = await Collection.findOne({ slug });

    if (!existing) {
      await Collection.create({
        ...col,
        slug,
        status: 'active',
        productIds: [],
      });
      logger.info(`🌱 Created system collection: ${col.name}`);
    }
  }
  logger.info('✅ System collections seeded');
};