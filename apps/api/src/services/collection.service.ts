import {
  collectionRepository,
  FindManyOptions,
} from '@repositories/collection.repository';
import { ICollection } from '@models/collection.model';
import { Types } from 'mongoose';
import {
  ConflictError,
  NotFoundError,
  BadRequestError,
} from '@utils/AppError';
import { slugify } from '@utils/string';

export class CollectionService {
  async findMany(filter: any, options: FindManyOptions) {
    return collectionRepository.findMany(filter, options);
  }

  async findById(id: string): Promise<ICollection> {
    const collection = await collectionRepository.findById(id);
    if (!collection) throw new NotFoundError('Collection not found');
    return collection;
  }

  async findBySlug(slug: string): Promise<ICollection> {
    const collection = await collectionRepository.findBySlug(slug);
    if (!collection) throw new NotFoundError('Collection not found');
    return collection;
  }

  async findFeatured(): Promise<ICollection[]> {
    return collectionRepository.findFeatured();
  }

  async create(data: Partial<ICollection>): Promise<ICollection> {
    const slug = slugify(data.name!);

    if (!slug) {
      throw new BadRequestError('Collection name produces an invalid slug');
    }

    const existingName = await collectionRepository.findByName(data.name!);
    if (existingName) {
      throw new ConflictError('A collection with this name already exists');
    }

    const existingSlug = await collectionRepository.findBySlug(slug);
    if (existingSlug) {
      throw new ConflictError('A collection with this URL already exists');
    }

    return collectionRepository.create({ ...data, slug });
  }

  async update(id: string, data: Partial<ICollection>): Promise<ICollection> {
    const collection = await collectionRepository.findById(id);
    if (!collection) throw new NotFoundError('Collection not found');

    if (data.name && data.name !== collection.name) {
      const newSlug = slugify(data.name);
      const existingSlug = await collectionRepository.findBySlug(newSlug);

      if (existingSlug && existingSlug._id.toString() !== id) {
        throw new ConflictError('A collection with this URL already exists');
      }

      data.slug = newSlug;
    }

    const updated = await collectionRepository.update(id, data);
    if (!updated) throw new NotFoundError('Collection not found');
    return updated;
  }

  async archive(id: string): Promise<ICollection> {
    const collection = await collectionRepository.findById(id);
    if (!collection) throw new NotFoundError('Collection not found');

    if (collection.status === 'archived') {
      throw new BadRequestError('Collection is already archived');
    }

    const archived = await collectionRepository.archive(id);
    if (!archived) throw new NotFoundError('Collection not found');
    return archived;
  }

  async restore(id: string): Promise<ICollection> {
    const collection = await collectionRepository.findById(id);
    if (!collection) throw new NotFoundError('Collection not found');

    const restored = await collectionRepository.update(id, { status: 'active' });
    if (!restored) throw new NotFoundError('Collection not found');
    return restored;
  }

  // ─────────────────────────────────────────────────────────
  // PRODUCT MANAGEMENT WITHIN COLLECTION
  // ─────────────────────────────────────────────────────────

  async addProducts(id: string, productIds: string[]): Promise<ICollection> {
    const collection = await collectionRepository.findById(id);
    if (!collection) throw new NotFoundError('Collection not found');

    // Validate ObjectIds
    const validIds = productIds.filter((pid) => Types.ObjectId.isValid(pid));
    if (validIds.length === 0) {
      throw new BadRequestError('No valid product IDs provided');
    }

    const updated = await collectionRepository.addProducts(id, validIds);
    if (!updated) throw new NotFoundError('Collection not found');
    return updated;
  }

  async removeProducts(id: string, productIds: string[]): Promise<ICollection> {
    const collection = await collectionRepository.findById(id);
    if (!collection) throw new NotFoundError('Collection not found');

    const validIds = productIds.filter((pid) => Types.ObjectId.isValid(pid));
    if (validIds.length === 0) {
      throw new BadRequestError('No valid product IDs provided');
    }

    const updated = await collectionRepository.removeProducts(id, validIds);
    if (!updated) throw new NotFoundError('Collection not found');
    return updated;
  }
}

export const collectionService = new CollectionService();