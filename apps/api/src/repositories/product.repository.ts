import { Product, IProduct, IProductVariant } from '@models/product.model';
import { SortOrder, Types } from 'mongoose';

export interface FindManyOptions {
  skip: number;
  limit: number;
  sort?: Record<string, SortOrder>;
}

export class ProductRepository {
  async findMany(
    filter: any,
    options: FindManyOptions
  ): Promise<{ data: IProduct[]; total: number }> {
    const [data, total] = await Promise.all([
      Product.find(filter)
        .skip(options.skip)
        .limit(options.limit)
        .sort(options.sort || { createdAt: -1 })
        .populate('brandId', 'name slug logo')
        .lean(),
      Product.countDocuments(filter),
    ]);
    return { data: data as unknown as IProduct[], total };
  }

  async findById(id: string): Promise<IProduct | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return Product.findById(id)
      .populate('brandId', 'name slug logo')
      .lean() as unknown as Promise<IProduct | null>;
  }

  async findBySlug(slug: string): Promise<IProduct | null> {
    return Product.findOne({ slug })
      .populate('brandId', 'name slug logo')
      .lean() as unknown as Promise<IProduct | null>;
  }

  async findByReferenceNumber(
    referenceNumber: string
  ): Promise<IProduct | null> {
    return Product.findOne({
      'specs.referenceNumber': referenceNumber,
    }).lean() as unknown as Promise<IProduct | null>;
  }

  async findSkusIn(skus: string[]): Promise<IProduct[]> {
    return Product.find({ 'variants.sku': { $in: skus } }).lean() as unknown as Promise<IProduct[]>;
  }

  async create(data: Partial<IProduct>): Promise<IProduct> {
    return Product.create(data);
  }

  async update(id: string, data: Partial<IProduct>): Promise<IProduct | null> {
    return Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async archive(id: string): Promise<IProduct | null> {
    return Product.findByIdAndUpdate(id, { status: 'archived' }, { new: true });
  }

  // ─────────────────────────────────────────────────────────
  // VARIANT OPERATIONS
  // ─────────────────────────────────────────────────────────

  async addVariant(
    productId: string,
    variant: IProductVariant
  ): Promise<IProduct | null> {
    return Product.findByIdAndUpdate(
      productId,
      { $push: { variants: variant } },
      { new: true, runValidators: true }
    );
  }

  async addVariants(
    productId: string,
    variants: IProductVariant[]
  ): Promise<IProduct | null> {
    return Product.findByIdAndUpdate(
      productId,
      { $push: { variants: { $each: variants } } },
      { new: true, runValidators: true }
    );
  }

  async updateVariant(
    productId: string,
    variantId: string,
    data: Partial<IProductVariant>
  ): Promise<IProduct | null> {
    const update: Record<string, unknown> = {};
    Object.entries(data).forEach(([key, value]) => {
      update[`variants.$.${key}`] = value;
    });

    return Product.findOneAndUpdate(
      { _id: productId, 'variants._id': variantId },
      { $set: update },
      { new: true, runValidators: true }
    );
  }

  async removeVariant(
    productId: string,
    variantId: string
  ): Promise<IProduct | null> {
    return Product.findByIdAndUpdate(
      productId,
      { $pull: { variants: { _id: variantId } } },
      { new: true }
    );
  }

  /**
   * Atomic stock adjustment. Prevents race conditions and negative stock.
   */
  async adjustStock(
    productId: string,
    variantId: string,
    adjustment: number
  ): Promise<IProduct | null> {
    // First, atomically increment only if result stays non-negative
    const variantObjectId = new Types.ObjectId(variantId);
    const product = await Product.findOne({
      _id: productId,
      'variants._id': variantObjectId,
    });

    if (!product) return null;

    const variant = product.variants.find(
      (v) => v._id.toString() === variantId
    );
    if (!variant) return null;

    if (variant.stock + adjustment < 0) return null;

    return Product.findOneAndUpdate(
      { _id: productId, 'variants._id': variantObjectId },
      { $inc: { 'variants.$.stock': adjustment } },
      { new: true }
    );
  }

  async setStock(
    productId: string,
    variantId: string,
    stock: number
  ): Promise<IProduct | null> {
    return Product.findOneAndUpdate(
      { _id: productId, 'variants._id': variantId },
      { $set: { 'variants.$.stock': stock } },
      { new: true, runValidators: true }
    );
  }

  // ─────────────────────────────────────────────────────────
  // INVENTORY AGGREGATION
  // ─────────────────────────────────────────────────────────

  async findAllVariantsFlat(): Promise<unknown[]> {
    return Product.aggregate([
      { $match: { status: { $ne: 'archived' } } },
      { $unwind: '$variants' },
      {
        $project: {
          _id: 0,
          productId: '$_id',
          productName: '$name',
          productSlug: '$slug',
          sku: '$variants.sku',
          variantId: '$variants._id',
          dialColor: '$variants.dialColor',
          caseMaterial: '$variants.caseMaterial',
          caseSize: '$variants.caseSize',
          strapType: '$variants.strapType',
          price: '$variants.price',
          stock: '$variants.stock',
          lowStockThreshold: '$variants.lowStockThreshold',
          isActive: '$variants.isActive',
          isLowStock: {
            $and: [
              { $gt: ['$variants.stock', 0] },
              { $lte: ['$variants.stock', '$variants.lowStockThreshold'] },
            ],
          },
          isOutOfStock: { $eq: ['$variants.stock', 0] },
        },
      },
      { $sort: { stock: 1 } },
    ]);
  }
}

export const productRepository = new ProductRepository();
