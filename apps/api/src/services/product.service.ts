import {
  productRepository,
  FindManyOptions,
} from "@repositories/product.repository";
import { IProduct, IProductVariant } from "@models/product.model";
import { Brand } from "@models/brand.model";
import { Types } from "mongoose";
import { ConflictError, NotFoundError, BadRequestError } from "@utils/AppError";
import { slugify } from "@utils/string";
import { generateSku } from "@utils/sku";

interface MatrixInput {
  dialColors: string[];
  caseMaterials: string[];
  strapTypes: string[];
  caseSizes: number[];
  defaultPrice: number;
  defaultStock?: number;
  defaultLowStockThreshold?: number;
  movement: IProductVariant["movement"];
  complications?: string[];
  images?: string[];
}

export class ProductService {
  async findMany(filter: any, options: FindManyOptions) {
    return productRepository.findMany(filter, options);
  }

  async findById(id: string): Promise<IProduct> {
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError("Product not found");
    return product;
  }

  async findBySlug(slug: string): Promise<IProduct> {
    const product = await productRepository.findBySlug(slug);
    if (!product) throw new NotFoundError("Product not found");
    return product;
  }

  async create(data: Partial<IProduct>): Promise<IProduct> {
    // Custom slug from the admin form wins; otherwise derive from name
    const slug = slugify(data.slug || data.name!);
    if (!slug) {
      throw new BadRequestError("Product name produces an invalid slug");
    }

    const existingSlug = await productRepository.findBySlug(slug);
    if (existingSlug) {
      throw new ConflictError("A product with this URL already exists");
    }

    const existingRef = await productRepository.findByReferenceNumber(
      data.specs!.referenceNumber,
    );
    if (existingRef) {
      throw new ConflictError("Reference number already in use");
    }

    // Auto-generate SKUs for variants that don't have them
    if (data.variants && data.variants.length > 0) {
      // Get brand name for SKU generation
      const brand = await Brand.findById(data.brandId);
      const brandName = brand?.name || "UNKNOWN";

      for (const variant of data.variants) {
        if (!variant.sku) {
          variant.sku = generateSku(brandName, {
            dialColor: variant.dialColor,
            caseMaterial: variant.caseMaterial,
            strapType: variant.strapType,
            caseSize: variant.caseSize,
          });
        }
      }

      // Validate variant SKUs
      const skus = data.variants.map((v) => v.sku).filter(Boolean) as string[];
      const duplicateSkus = skus.filter((s, i) => skus.indexOf(s) !== i);
      if (duplicateSkus.length > 0) {
        throw new ConflictError(
          `Duplicate SKUs in payload: ${duplicateSkus.join(", ")}`,
        );
      }

      if (skus.length > 0) {
        const existingSkus = await productRepository.findSkusIn(skus);
        if (existingSkus.length > 0) {
          const conflict = existingSkus[0].variants.find((v) =>
            skus.includes(v.sku),
          );
          throw new ConflictError(`SKU already exists: ${conflict?.sku}`);
        }
      }
    }

    const product = await productRepository.create({
      ...data,
      slug,
      status: data.status || "draft",
    });

    return product;
  }

  async update(id: string, data: Partial<IProduct>): Promise<IProduct> {
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError("Product not found");

    if (data.name && data.name !== product.name) {
      const newSlug = slugify(data.name);
      const existingSlug = await productRepository.findBySlug(newSlug);
      if (existingSlug && existingSlug._id.toString() !== id) {
        throw new ConflictError("A product with this URL already exists");
      }
      data.slug = newSlug;
    }

    if (
      data.specs?.referenceNumber &&
      data.specs.referenceNumber !== product.specs.referenceNumber
    ) {
      const existingRef = await productRepository.findByReferenceNumber(
        data.specs.referenceNumber,
      );
      if (existingRef && existingRef._id.toString() !== id) {
        throw new ConflictError("Reference number already in use");
      }
    }

    const updated = await productRepository.update(id, data);
    if (!updated) throw new NotFoundError("Product not found");
    return updated;
  }

  async archive(id: string): Promise<IProduct> {
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError("Product not found");
    if (product.status === "archived") {
      throw new BadRequestError("Product is already archived");
    }
    const archived = await productRepository.archive(id);
    if (!archived) throw new NotFoundError("Product not found");
    return archived;
  }

  async restore(id: string): Promise<IProduct> {
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError("Product not found");
    const restored = await productRepository.update(id, { status: "draft" });
    if (!restored) throw new NotFoundError("Product not found");
    return restored;
  }

  async publish(id: string): Promise<IProduct> {
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError("Product not found");

    const activeVariants = product.variants.filter((v) => v.isActive);
    if (activeVariants.length === 0) {
      throw new BadRequestError(
        "Cannot publish: product has no active variants",
      );
    }

    const updated = await productRepository.update(id, {
      status: "active",
      publishedAt: product.publishedAt || new Date(),
    });

    if (!updated) throw new NotFoundError("Product not found");
    return updated;
  }

  // ─────────────────────────────────────────────────────────
  // VARIANT OPERATIONS
  // ─────────────────────────────────────────────────────────

  async addVariant(
    productId: string,
    variantData: Partial<IProductVariant> & { brandName: string },
  ): Promise<IProduct> {
    const product = await productRepository.findById(productId);
    if (!product) throw new NotFoundError("Product not found");

    const { brandName, ...variant } = variantData;

    const sku =
      variant.sku ||
      generateSku(brandName, {
        dialColor: variant.dialColor!,
        caseMaterial: variant.caseMaterial!,
        strapType: variant.strapType!,
        caseSize: variant.caseSize!,
      });

    const existing = await productRepository.findSkusIn([sku]);
    if (existing.length > 0) {
      throw new ConflictError(`SKU already exists: ${sku}`);
    }

    const newVariant = {
      ...variant,
      _id: new Types.ObjectId(),
      sku,
      lowStockThreshold: variant.lowStockThreshold ?? 3,
      complications: variant.complications || [],
      images: variant.images || [],
      isActive: variant.isActive ?? true,
    } as IProductVariant;

    const updated = await productRepository.addVariant(productId, newVariant);
    if (!updated) throw new NotFoundError("Product not found");
    return updated;
  }

  async updateVariant(
    productId: string,
    variantId: string,
    data: Partial<IProductVariant>,
  ): Promise<IProduct> {
    const product = await productRepository.findById(productId);
    if (!product) throw new NotFoundError("Product not found");

    const variant = product.variants.find(
      (v) => v._id.toString() === variantId,
    );
    if (!variant) throw new NotFoundError("Variant not found");

    if (data.sku && data.sku !== variant.sku) {
      const existing = await productRepository.findSkusIn([data.sku]);
      if (existing.length > 0) {
        throw new ConflictError(`SKU already exists: ${data.sku}`);
      }
    }

    const updated = await productRepository.updateVariant(
      productId,
      variantId,
      data,
    );
    if (!updated) throw new NotFoundError("Product not found");
    return updated;
  }

  async removeVariant(productId: string, variantId: string): Promise<IProduct> {
    const product = await productRepository.findById(productId);
    if (!product) throw new NotFoundError("Product not found");

    if (product.variants.length <= 1) {
      throw new BadRequestError("Cannot remove the last variant");
    }

    const variant = product.variants.find(
      (v) => v._id.toString() === variantId,
    );
    if (!variant) throw new NotFoundError("Variant not found");

    const updated = await productRepository.removeVariant(productId, variantId);
    if (!updated) throw new NotFoundError("Product not found");
    return updated;
  }

  async adjustStock(
    productId: string,
    variantId: string,
    adjustment: number,
  ): Promise<IProduct> {
    if (!Number.isInteger(adjustment)) {
      throw new BadRequestError("Adjustment must be an integer");
    }

    const updated = await productRepository.adjustStock(
      productId,
      variantId,
      adjustment,
    );
    if (!updated) {
      throw new BadRequestError(
        "Stock cannot go negative or variant not found",
      );
    }
    return updated;
  }

  async setStock(
    productId: string,
    variantId: string,
    stock: number,
  ): Promise<IProduct> {
    if (stock < 0 || !Number.isInteger(stock)) {
      throw new BadRequestError("Stock must be a non-negative integer");
    }

    const updated = await productRepository.setStock(
      productId,
      variantId,
      stock,
    );
    if (!updated) throw new NotFoundError("Product or variant not found");
    return updated;
  }

  // ─────────────────────────────────────────────────────────
  // VARIANT MATRIX GENERATOR ⭐
  // ─────────────────────────────────────────────────────────

  async generateVariantMatrix(
    productId: string,
    matrix: MatrixInput,
    brandName: string,
  ): Promise<{
    created: number;
    skipped: number;
    variants: IProductVariant[];
  }> {
    const product = await productRepository.findById(productId);
    if (!product) throw new NotFoundError("Product not found");

    const existingSkus = new Set(product.variants.map((v) => v.sku));
    const combinations: IProductVariant[] = [];

    for (const dialColor of matrix.dialColors) {
      for (const caseMaterial of matrix.caseMaterials) {
        for (const strapType of matrix.strapTypes) {
          for (const caseSize of matrix.caseSizes) {
            const sku = generateSku(brandName, {
              dialColor,
              caseMaterial,
              strapType,
              caseSize,
            });

            if (existingSkus.has(sku)) continue;
            existingSkus.add(sku);

            combinations.push({
              _id: new Types.ObjectId(),
              sku,
              dialColor,
              caseMaterial,
              caseSize,
              strapType,
              strapColor: caseMaterial,
              movement: matrix.movement,
              complications: matrix.complications || [],
              price: matrix.defaultPrice,
              stock: matrix.defaultStock ?? 0,
              lowStockThreshold: matrix.defaultLowStockThreshold ?? 3,
              images: matrix.images || [],
              isActive: true,
            });
          }
        }
      }
    }

    if (combinations.length === 0) {
      return { created: 0, skipped: 0, variants: [] };
    }

    const skus = combinations.map((v) => v.sku);
    const conflicts = await productRepository.findSkusIn(skus);
    if (conflicts.length > 0) {
      throw new ConflictError(
        `SKU conflict with another product: ${conflicts[0].variants[0].sku}`,
      );
    }

    const updated = await productRepository.addVariants(
      productId,
      combinations,
    );
    if (!updated) throw new NotFoundError("Product not found");

    return {
      created: combinations.length,
      skipped: 0,
      variants: combinations,
    };
  }

  // ─────────────────────────────────────────────────────────
  // INVENTORY
  // ─────────────────────────────────────────────────────────

  async getInventoryFlat() {
    return productRepository.findAllVariantsFlat();
  }
}

export const productService = new ProductService();
