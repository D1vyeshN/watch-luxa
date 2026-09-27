import { Category } from '@models/category.model';
import { logger } from './logger';
import { slugify } from '@utils/string';

const SYSTEM_CATEGORIES = [
  { name: 'Dive Watches', icon: 'waves', displayOrder: 1 },
  { name: 'Dress Watches', icon: 'suit', displayOrder: 2 },
  { name: 'Pilot Watches', icon: 'plane', displayOrder: 3 },
  { name: 'Racing Watches', icon: 'flag', displayOrder: 4 },
  { name: 'Field Watches', icon: 'compass', displayOrder: 5 },
  { name: 'GMT Watches', icon: 'globe', displayOrder: 6 },
  { name: 'Smart Watches', icon: 'cpu', displayOrder: 7 },
  { name: 'Pocket Watches', icon: 'clock', displayOrder: 8 },
];

export const seedSystemCategories = async () => {
  for (const cat of SYSTEM_CATEGORIES) {
    const slug = slugify(cat.name);
    const existing = await Category.findOne({ slug });

    if (!existing) {
      await Category.create({
        ...cat,
        slug,
        isSystem: true,
        status: 'active',
        description: `Browse our collection of ${cat.name.toLowerCase()}`,
      });
      logger.info(`🌱 Created system category: ${cat.name}`);
    }
  }
  logger.info('✅ System categories seeded');
};
