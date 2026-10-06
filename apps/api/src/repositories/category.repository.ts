import { Category, ICategory } from '@models/category.model';
import { SortOrder } from 'mongoose';

export interface CategoryFindManyOptions {
  skip: number;
  limit: number;
  sort?: Record<string, SortOrder>;
}

export class CategoryRepository {
  async findMany(
    filter: any,
    options: CategoryFindManyOptions
  ): Promise<{ data: ICategory[]; total: number }> {
    const [data, total] = await Promise.all([
      Category.find(filter)
        .skip(options.skip)
        .limit(options.limit)
        .sort(options.sort || { displayOrder: 1, name: 1 })
        .lean(),
      Category.countDocuments(filter),
    ]);
    return { data: data as unknown as ICategory[], total };
  }

  async findById(id: string): Promise<ICategory | null> {
    return Category.findById(id).lean() as unknown as Promise<ICategory | null>;
  }

  async findBySlug(slug: string): Promise<ICategory | null> {
    return Category.findOne({ slug }).lean() as unknown as Promise<ICategory | null>;
  }

  async findByName(name: string): Promise<ICategory | null> {
    // Escape regex metacharacters so names like "G.M.T." match literally
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return Category.findOne({
      name: { $regex: `^${escaped}$`, $options: 'i' },
    }).lean() as unknown as Promise<ICategory | null>;
  }

  async findActive(): Promise<ICategory[]> {
    return Category.find({ status: 'active' })
      .sort({ displayOrder: 1, name: 1 })
      .lean() as unknown as Promise<ICategory[]>;
  }

  async create(data: Partial<ICategory>): Promise<ICategory> {
    return Category.create(data);
  }

  async update(id: string, data: Partial<ICategory>): Promise<ICategory | null> {
    return Category.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async archive(id: string): Promise<ICategory | null> {
    return Category.findByIdAndUpdate(
      id,
      { status: 'archived' },
      { new: true }
    );
  }
}

export const categoryRepository = new CategoryRepository();
