import { Brand, IBrand } from '@models/brand.model';
import { SortOrder } from 'mongoose';

export interface FindManyOptions {
  skip: number;
  limit: number;
  sort?: Record<string, SortOrder>;
}

export class BrandRepository {
  async findMany(
    filter: any,
    options: FindManyOptions
  ): Promise<{ data: IBrand[]; total: number }> {
    const [data, total] = await Promise.all([
      Brand.find(filter)
        .skip(options.skip)
        .limit(options.limit)
        .sort(options.sort || { createdAt: -1 })
        .lean(),
      Brand.countDocuments(filter),
    ]);
    return { data: data as unknown as IBrand[], total };
  }

  async findById(id: string): Promise<IBrand | null> {
    return Brand.findById(id).lean() as unknown as Promise<IBrand | null>;
  }

  async findBySlug(slug: string): Promise<IBrand | null> {
    return Brand.findOne({ slug }).lean() as unknown as Promise<IBrand | null>;
  }

  async findByName(name: string): Promise<IBrand | null> {
    return Brand.findOne({
      name: { $regex: `^${name}$`, $options: 'i' },
    }).lean() as unknown as Promise<IBrand | null>;
  }

  async create(data: Partial<IBrand>): Promise<IBrand> {
    return Brand.create(data);
  }

  async update(id: string, data: Partial<IBrand>): Promise<IBrand | null> {
    return Brand.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async archive(id: string): Promise<IBrand | null> {
    return Brand.findByIdAndUpdate(
      id,
      { status: 'archived' },
      { new: true }
    );
  }
}

export const brandRepository = new BrandRepository();
