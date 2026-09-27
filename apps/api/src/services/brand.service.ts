import { brandRepository, FindManyOptions } from '@repositories/brand.repository';
import { IBrand } from '@models/brand.model';
import {
  ConflictError,
  NotFoundError,
  BadRequestError,
} from '@utils/AppError';
import { slugify } from '@utils/string';

export class BrandService {
  async findMany(filter: any, options: FindManyOptions) {
    return brandRepository.findMany(filter, options);
  }

  async findById(id: string): Promise<IBrand> {
    const brand = await brandRepository.findById(id);
    if (!brand) throw new NotFoundError('Brand not found');
    return brand;
  }

  async findBySlug(slug: string): Promise<IBrand> {
    const brand = await brandRepository.findBySlug(slug);
    if (!brand) throw new NotFoundError('Brand not found');
    return brand;
  }

  async create(data: {
    name: string;
    logo?: string;
    country?: string;
    founded?: number;
    heritageStory?: string;
    featured?: boolean;
  }): Promise<IBrand> {
    const slug = slugify(data.name);

    if (!slug) {
      throw new BadRequestError('Brand name produces an invalid slug');
    }

    // Check for duplicate name
    const existingName = await brandRepository.findByName(data.name);
    if (existingName) {
      throw new ConflictError('A brand with this name already exists');
    }

    // Check for duplicate slug
    const existingSlug = await brandRepository.findBySlug(slug);
    if (existingSlug) {
      throw new ConflictError('A brand with this URL already exists');
    }

    return brandRepository.create({ ...data, slug });
  }

  async update(id: string, data: Partial<IBrand>): Promise<IBrand> {
    const brand = await brandRepository.findById(id);
    if (!brand) throw new NotFoundError('Brand not found');

    // If name is changing, regenerate slug and check for collisions
    if (data.name && data.name !== brand.name) {
      const newSlug = slugify(data.name);
      const existingSlug = await brandRepository.findBySlug(newSlug);

      if (existingSlug && existingSlug._id.toString() !== id) {
        throw new ConflictError('A brand with this URL already exists');
      }

      data.slug = newSlug;
    }

    const updated = await brandRepository.update(id, data);
    if (!updated) throw new NotFoundError('Brand not found');
    return updated;
  }

  async archive(id: string): Promise<IBrand> {
    const brand = await brandRepository.findById(id);
    if (!brand) throw new NotFoundError('Brand not found');

    if (brand.status === 'archived') {
      throw new BadRequestError('Brand is already archived');
    }

    const archived = await brandRepository.archive(id);
    if (!archived) throw new NotFoundError('Brand not found');
    return archived;
  }

  async restore(id: string): Promise<IBrand> {
    const brand = await brandRepository.findById(id);
    if (!brand) throw new NotFoundError('Brand not found');

    const restored = await brandRepository.update(id, { status: 'active' });
    if (!restored) throw new NotFoundError('Brand not found');
    return restored;
  }
}

export const brandService = new BrandService();
