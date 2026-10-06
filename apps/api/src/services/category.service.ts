import {
  categoryRepository,
  CategoryFindManyOptions,
} from '@repositories/category.repository';
import { ICategory } from '@models/category.model';
import { Product } from '@models/product.model';
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

    // System categories cannot be renamed, re-slugged or archived
    if (category.isSystem) {
      if (data.name && data.name !== category.name) {
        throw new ForbiddenError('Cannot rename a system category');
      }
      if (data.status && data.status !== category.status) {
        throw new ForbiddenError('Cannot change the status of a system category');
      }
      delete data.slug;
    }

    // Archiving through update goes through the same checks as DELETE
    if (data.status === 'archived' && category.status !== 'archived') {
      await this.assertNoActiveProducts(category.slug);
    }

    // If name is changing, regenerate slug
    const oldSlug = category.slug;
    if (data.name && data.name !== category.name && !category.isSystem) {
      const existingName = await categoryRepository.findByName(data.name);
      if (existingName && existingName._id.toString() !== id) {
        throw new ConflictError('A category with this name already exists');
      }

      const newSlug = slugify(data.name);
      if (!newSlug) {
        throw new BadRequestError('Category name produces an invalid slug');
      }
      const existingSlug = await categoryRepository.findBySlug(newSlug);

      if (existingSlug && existingSlug._id.toString() !== id) {
        throw new ConflictError('A category with this URL already exists');
      }

      data.slug = newSlug;
    }

    const updated = await categoryRepository.update(id, data);
    if (!updated) throw new NotFoundError('Category not found');

    // Products reference categories by slug — keep them attached on rename
    if (data.slug && data.slug !== oldSlug) {
      await Product.updateMany({ category: oldSlug }, { $set: { category: data.slug } });
    }

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

    await this.assertNoActiveProducts(category.slug);

    const archived = await categoryRepository.archive(id);
    if (!archived) throw new NotFoundError('Category not found');
    return archived;
  }

  /** Archiving a category in use would orphan live products on the storefront. */
  private async assertNoActiveProducts(slug: string): Promise<void> {
    const count = await Product.countDocuments({ category: slug, status: 'active' });
    if (count > 0) {
      throw new ConflictError(
        `${count} active ${count === 1 ? 'product uses' : 'products use'} this category — move ${count === 1 ? 'it' : 'them'} to another category first`,
      );
    }
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
