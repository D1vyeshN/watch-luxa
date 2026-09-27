import {
  categoryRepository,
  CategoryFindManyOptions,
} from '@repositories/category.repository';
import { ICategory } from '@models/category.model';
import {
  ConflictError,
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from '@utils/AppError';
import { slugify } from '@utils/string';

export class CategoryService {
  async findMany(filter: any, options: CategoryFindManyOptions) {
    return categoryRepository.findMany(filter, options);
  }

  async findById(id: string): Promise<ICategory> {
    const category = await categoryRepository.findById(id);
    if (!category) throw new NotFoundError('Category not found');
    return category;
  }

  async findBySlug(slug: string): Promise<ICategory> {
    const category = await categoryRepository.findBySlug(slug);
    if (!category) throw new NotFoundError('Category not found');
    return category;
  }

  async findActive(): Promise<ICategory[]> {
    return categoryRepository.findActive();
  }

  async create(data: {
    name: string;
    description?: string;
    image?: string;
    icon?: string;
    displayOrder?: number;
  }): Promise<ICategory> {
    const slug = slugify(data.name);

    if (!slug) {
      throw new BadRequestError('Category name produces an invalid slug');
    }

    const existingName = await categoryRepository.findByName(data.name);
    if (existingName) {
      throw new ConflictError('A category with this name already exists');
    }

    const existingSlug = await categoryRepository.findBySlug(slug);
    if (existingSlug) {
      throw new ConflictError('A category with this URL already exists');
    }

    return categoryRepository.create({ ...data, slug });
  }

  async update(id: string, data: Partial<ICategory>): Promise<ICategory> {
    const category = await categoryRepository.findById(id);
    if (!category) throw new NotFoundError('Category not found');

    // System categories cannot be renamed or have their slug changed
    if (category.isSystem) {
      if (data.name && data.name !== category.name) {
        throw new ForbiddenError('Cannot rename a system category');
      }
      delete data.slug;
    }

    // If name is changing, regenerate slug
    if (data.name && data.name !== category.name && !category.isSystem) {
      const newSlug = slugify(data.name);
      const existingSlug = await categoryRepository.findBySlug(newSlug);

      if (existingSlug && existingSlug._id.toString() !== id) {
        throw new ConflictError('A category with this URL already exists');
      }

      data.slug = newSlug;
    }

    const updated = await categoryRepository.update(id, data);
    if (!updated) throw new NotFoundError('Category not found');
    return updated;
  }

  async archive(id: string): Promise<ICategory> {
    const category = await categoryRepository.findById(id);
    if (!category) throw new NotFoundError('Category not found');

    if (category.isSystem) {
      throw new ForbiddenError('System categories cannot be archived');
    }

    if (category.status === 'archived') {
      throw new BadRequestError('Category is already archived');
    }

    // TODO: After Product module exists, check if active products reference this category
    // If yes, block archiving or require product reassignment

    const archived = await categoryRepository.archive(id);
    if (!archived) throw new NotFoundError('Category not found');
    return archived;
  }

  async restore(id: string): Promise<ICategory> {
    const category = await categoryRepository.findById(id);
    if (!category) throw new NotFoundError('Category not found');

    const restored = await categoryRepository.update(id, { status: 'active' });
    if (!restored) throw new NotFoundError('Category not found');
    return restored;
  }
}

export const categoryService = new CategoryService();
