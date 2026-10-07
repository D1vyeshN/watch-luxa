import { escapeRegex } from '@utils/regex';
import { Collection, ICollection } from '@models/collection.model';
import { SortOrder } from 'mongoose';

export interface FindManyOptions {
  skip: number;
  limit: number;
  sort?: Record<string, SortOrder>;
}

export class CollectionRepository {
  async findMany(
    filter: any,
    options: FindManyOptions
  ): Promise<{ data: ICollection[]; total: number }> {
    const [data, total] = await Promise.all([
      Collection.find(filter)
        .skip(options.skip)
        .limit(options.limit)
        .sort(options.sort || { displayOrder: 1, name: 1 })
        .lean(),
      Collection.countDocuments(filter),
    ]);
    return { data: data as unknown as ICollection[], total };
  }

  async findById(id: string): Promise<ICollection | null> {
    return Collection.findById(id).lean() as unknown as Promise<ICollection | null>;
  }

  async findBySlug(slug: string): Promise<ICollection | null> {
    return Collection.findOne({ slug }).lean() as unknown as Promise<ICollection | null>;
  }

  async findByName(name: string): Promise<ICollection | null> {
    return Collection.findOne({
      name: { $regex: `^${escapeRegex(name)}$`, $options: 'i' },
    }).lean() as unknown as Promise<ICollection | null>;
  }

  async findFeatured(): Promise<ICollection[]> {
    return Collection.find({ status: 'active', featured: true })
      .sort({ displayOrder: 1 })
      .lean() as unknown as Promise<ICollection[]>;
  }

  async create(data: Partial<ICollection>): Promise<ICollection> {
    return Collection.create(data);
  }

  async update(id: string, data: Partial<ICollection>): Promise<ICollection | null> {
    return Collection.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async archive(id: string): Promise<ICollection | null> {
    return Collection.findByIdAndUpdate(
      id,
      { status: 'archived' },
      { new: true }
    );
  }

  async addProducts(
    id: string,
    productIds: string[]
  ): Promise<ICollection | null> {
    return Collection.findByIdAndUpdate(
      id,
      { $addToSet: { productIds: { $each: productIds } } },
      { new: true }
    );
  }

  async removeProducts(
    id: string,
    productIds: string[]
  ): Promise<ICollection | null> {
    return Collection.findByIdAndUpdate(
      id,
      { $pull: { productIds: { $in: productIds } } },
      { new: true }
    );
  }
}

export const collectionRepository = new CollectionRepository();
