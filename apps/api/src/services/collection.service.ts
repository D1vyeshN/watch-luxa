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
import {
  existingProductIds,
  invalidateCollectionCaches,
  syncProductsForCollection,
} from './collectionSync';

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

    const productIds = await existingProductIds(data.productIds);
    const created = await collectionRepository.create({
      ...data,
      productIds: productIds as unknown as ICollection['productIds'],
      slug,
    });

    await syncProductsForCollection(created._id, [], productIds);
    await invalidateCollectionCaches();
    return created;
  }

  async update(id: string, data: Partial<ICollection>): Promise<ICollection> {
    const collection = await collectionRepository.findById(id);
    if (!collection) throw new NotFoundError('Collection not found');

    if (data.name && data.name !== collection.name) {
      const existingName = await collectionRepository.findByName(data.name);
      if (existingName && existingName._id.toString() !== id) {
        throw new ConflictError('A collection with this name already exists');
      }

      const newSlug = slugify(data.name);
      if (!newSlug) {
        throw new BadRequestError('Collection name produces an invalid slug');
      }
      const existingSlug = await collectionRepository.findBySlug(newSlug);

      if (existingSlug && existingSlug._id.toString() !== id) {
        throw new ConflictError('A collection with this URL already exists');
      }

      data.slug = newSlug;
    }

    const productIdsChanged = data.productIds !== undefined;
    if (productIdsChanged) {
      data.productIds = (await existingProductIds(data.productIds)) as unknown as ICollection['productIds'];
    }

    const updated = await collectionRepository.update(id, data);
    if (!updated) throw new NotFoundError('Collection not found');

    if (productIdsChanged) {
      await syncProductsForCollection(id, collection.productIds, data.productIds);
    }
    await invalidateCollectionCaches();
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
    await invalidateCollectionCaches();
    return archived;
  }

  async restore(id: string): Promise<ICollection> {
    const collection = await collectionRepository.findById(id);
    if (!collection) throw new NotFoundError('Collection not found');

    const restored = await collectionRepository.update(id, { status: 'active' });
    if (!restored) throw new NotFoundError('Collection not found');
    await invalidateCollectionCaches();
    return restored;
  }

  // ─────────────────────────────────────────────────────────
  // PRODUCT MANAGEMENT WITHIN COLLECTION
  // ─────────────────────────────────────────────────────────

  async addProducts(id: string, productIds: string[]): Promise<ICollection> {
    const collection = await collectionRepository.findById(id);
    if (!collection) throw new NotFoundError('Collection not found');

    const validIds = await existingProductIds(productIds);
    if (validIds.length === 0) {
      throw new BadRequestError('No valid product IDs provided');
    }

    const updated = await collectionRepository.addProducts(id, validIds);
    if (!updated) throw new NotFoundError('Collection not found');
    await syncProductsForCollection(id, collection.productIds, updated.productIds);
    await invalidateCollectionCaches();
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
    await syncProductsForCollection(id, collection.productIds, updated.productIds);
    await invalidateCollectionCaches();
    return updated;
  }
}

export const collectionService = new CollectionService();
