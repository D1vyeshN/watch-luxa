import { Types } from 'mongoose';
import { Product, IProduct, IProductVariant } from '@models/product.model';
import { Brand } from '@models/brand.model';
import { Category } from '@models/category.model';
import { productRepository } from '@repositories/product.repository';
import {
  parseCsvBuffer,
  ParsedCsvRow,
  parseBool,
  parseNumber,
  parseInt_,
  parseList,
  parseUrl,
} from '@utils/csvParser';
import { generateSku } from '@utils/sku';
import { slugify } from '@utils/string';
import { BadRequestError } from '@utils/AppError';
import { logger } from '@config/logger';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface GroupedProduct {
  referenceNumber: string;
  productData: Partial<IProduct>;
  variants: Partial<IProductVariant>[];
  rowNumbers: number[];
  brandSlug: string;
  categorySlug: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export interface ImportPreview {
  totalRows: number;
  totalProducts: number;
  totalVariants: number;
  products: Array<{
    referenceNumber: string;
    name: string;
    brand: string;
    category: string;
    variantCount: number;
    priceRange: { min: number; max: number };
  }>;
  errors: ValidationError[];
  warnings: string[];
}

export interface ImportResult extends ImportPreview {
  imported: number;
  importedVariants: number;
}

// ─────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────

export class CsvImportService {
  /**
   * Parse a CSV buffer, group by reference number, validate everything.
   * Returns a preview without touching the database (except existence checks).
   */
  async preview(buffer: Buffer): Promise<ImportPreview> {
    const { rows } = parseCsvBuffer(buffer);
    return this.buildPreview(rows);
  }

  /**
   * Full import. Same as preview but persists to database in a transaction.
   */
  async import(buffer: Buffer): Promise<ImportResult> {
    const { rows } = parseCsvBuffer(buffer);
    const preview = await this.buildPreview(rows);

    if (preview.errors.length > 0) {
      throw new BadRequestError(
        `Import aborted: ${preview.errors.length} validation errors. Fix and retry.`
      );
    }

    // Persist — grouped products (use the groups from preview which have brandId attached)
    const groups = await this.groupRows(rows);

    // Re-attach brand IDs (they were attached in buildPreview but we need them here too)
    const brandSlugs = [...new Set(groups.map((g) => g.brandSlug))];
    const brands = await Brand.find({ slug: { $in: brandSlugs } }).lean();
    const brandMap = new Map(brands.map((b) => [b.slug, b]));

    for (const group of groups) {
      const brand = brandMap.get(group.brandSlug);
      if (brand) {
        group.productData.brandId = brand._id as Types.ObjectId;

        // Generate SKUs for variants missing one
        for (let i = 0; i < group.variants.length; i++) {
          const variant = group.variants[i];
          if (!variant.sku) {
            variant.sku = generateSku(brand.name, {
              dialColor: variant.dialColor!,
              caseMaterial: variant.caseMaterial!,
              strapType: variant.strapType!,
              caseSize: variant.caseSize!,
            });
          }
        }
      }
    }

    let importedProducts = 0;
    let importedVariants = 0;

    for (const group of groups) {
      // Add variants to product data before creating
      group.productData.variants = group.variants as IProductVariant[];
      await Product.create(group.productData);
      importedProducts++;
      importedVariants += group.variants.length;
    }

    logger.info(
      { importedProducts, importedVariants },
      'CSV import completed'
    );

    return {
      ...preview,
      imported: importedProducts,
      importedVariants,
    };
  }

  // ─────────────────────────────────────────────────────────
  // GROUPING
  // ─────────────────────────────────────────────────────────

  private async groupRows(rows: ParsedCsvRow[]): Promise<GroupedProduct[]> {
    const groups = new Map<string, GroupedProduct>();

    for (const row of rows) {
      const d = row.data;
      const ref = d.referenceNumber?.trim();

      if (!ref) continue;

      if (!groups.has(ref)) {
        const brandSlug = d.brandSlug?.trim() ?? '';
        const categorySlug = d.categorySlug?.trim() ?? '';

        groups.set(ref, {
          referenceNumber: ref,
          productData: {},
          variants: [],
          rowNumbers: [],
          brandSlug,
          categorySlug,
        });
      }

      const group = groups.get(ref)!;
      group.rowNumbers.push(row.rowNumber);

      // Product-level fields — first row wins
      if (Object.keys(group.productData).length === 0) {
        group.productData = this.buildProductData(d, row.rowNumber);
      }

      // Variant — every row
      group.variants.push(this.buildVariantData(d, row.rowNumber));
    }

    return Array.from(groups.values());
  }

  // ─────────────────────────────────────────────────────────
  // PREVIEW BUILDER
  // ─────────────────────────────────────────────────────────

  private async buildPreview(rows: ParsedCsvRow[]): Promise<ImportPreview> {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    // 1. Group by reference number
    const groups = await this.groupRows(rows);

    // 2. Fetch all brands and categories in one query
    const brandSlugs = [...new Set(groups.map((g) => g.brandSlug))];
    const categorySlugs = [...new Set(groups.map((g) => g.categorySlug))];

    const [brands, categories] = await Promise.all([
      Brand.find({ slug: { $in: brandSlugs } }).lean(),
      Category.find({ slug: { $in: categorySlugs } }).lean(),
    ]);

    const brandMap = new Map(brands.map((b) => [b.slug, b]));
    const categoryMap = new Map(categories.map((c) => [c.slug, c]));

    // 3. Validate each group
    const seenSkus = new Set<string>();
    const seenRefs = new Set<string>();

    for (const group of groups) {
      // 3a. Brand exists?
      const brand = brandMap.get(group.brandSlug);
      if (!brand) {
        errors.push({
          row: group.rowNumbers[0],
          field: 'brandSlug',
          message: `Brand "${group.brandSlug}" not found`,
        });
        continue;
      }

      // 3b. Category exists?
      const category = categoryMap.get(group.categorySlug);
      if (!category) {
        errors.push({
          row: group.rowNumbers[0],
          field: 'categorySlug',
          message: `Category "${group.categorySlug}" not found`,
        });
        continue;
      }

      // 3c. Duplicate reference number in CSV?
      if (seenRefs.has(group.referenceNumber)) {
        errors.push({
          row: group.rowNumbers[0],
          field: 'referenceNumber',
          message: `Duplicate reference number in CSV: ${group.referenceNumber}`,
        });
      }
      seenRefs.add(group.referenceNumber);

      // 3d. Reference number already exists in DB?
      const existingRef = await productRepository.findByReferenceNumber(
        group.referenceNumber
      );
      if (existingRef) {
        errors.push({
          row: group.rowNumbers[0],
          field: 'referenceNumber',
          message: `Reference number already exists in database: ${group.referenceNumber}`,
        });
      }

      // 3e. Attach brand ID
      group.productData.brandId = brand._id as Types.ObjectId;

      // 3f. Generate SKUs for variants missing one
      for (let i = 0; i < group.variants.length; i++) {
        const variant = group.variants[i];
        const rowNum = group.rowNumbers[i];

        if (!variant.sku) {
          variant.sku = generateSku(brand.name, {
            dialColor: variant.dialColor!,
            caseMaterial: variant.caseMaterial!,
            strapType: variant.strapType!,
            caseSize: variant.caseSize!,
          });
        }

        // Check for duplicate SKU within CSV
        if (seenSkus.has(variant.sku!)) {
          errors.push({
            row: rowNum,
            field: 'sku',
            message: `Duplicate SKU in CSV: ${variant.sku}`,
          });
        }
        seenSkus.add(variant.sku!);
      }
    }

    // 4. Bulk check SKUs against DB
    if (seenSkus.size > 0) {
      const existingProducts = await productRepository.findSkusIn(
        Array.from(seenSkus)
      );
      for (const product of existingProducts) {
        for (const variant of product.variants) {
          if (seenSkus.has(variant.sku)) {
            errors.push({
              row: 0,
              field: 'sku',
              message: `SKU already exists in database: ${variant.sku}`,
            });
          }
        }
      }
    }

    // 5. Build preview products
    const products = groups.map((group) => {
      const prices = group.variants
        .map((v) => v.price)
        .filter((p): p is number => p !== undefined);

      return {
        referenceNumber: group.referenceNumber,
        name: (group.productData.name as string) || 'Unknown',
        brand: group.brandSlug,
        category: group.categorySlug,
        variantCount: group.variants.length,
        priceRange: {
          min: prices.length ? Math.min(...prices) : 0,
          max: prices.length ? Math.max(...prices) : 0,
        },
      };
    });

    // 6. Warnings
    if (groups.length > 100) {
      warnings.push(
        `Large import: ${groups.length} products. This may take a minute.`
      );
    }

    return {
      totalRows: rows.length,
      totalProducts: groups.length,
      totalVariants: groups.reduce((sum, g) => sum + g.variants.length, 0),
      products,
      errors,
      warnings,
    };
  }

  // ─────────────────────────────────────────────────────────
  // BUILDERS
  // ─────────────────────────────────────────────────────────

  private buildProductData(
    d: Record<string, string>,
    rowNum: number
  ): Partial<IProduct> {
    return {
      name: d.productName.trim(),
      slug: slugify(d.productName),
      category: d.categorySlug.trim(),
      gender: (d.gender?.trim() as 'men' | 'women' | 'unisex') || 'unisex',
      shortDescription: d.shortDescription?.trim() || '',
      fullDescription: d.fullDescription?.trim() || '',
      story: d.story?.trim() || undefined,
      basePrice: parseInt_(d.basePrice, 'basePrice', rowNum, true)!,
      heroImage: parseUrl(d.heroImage, 'heroImage', rowNum, true)!,
      images: d.productImages
        ? d.productImages.split('|').map((s) => s.trim()).filter(Boolean)
        : [],
      video: parseUrl(d.video, 'video', rowNum) || undefined,
      tags: d.tags ? d.tags.split('|').map((s) => s.trim()).filter(Boolean) : [],
      status: (d.status?.trim() as 'draft' | 'active') || 'draft',
      featured: parseBool(d.featured),
      isLimitedEdition: parseBool(d.isLimitedEdition),
      limitedQuantity: parseInt_(
        d.limitedQuantity,
        'limitedQuantity',
        rowNum
      ),
      specs: {
        referenceNumber: d.referenceNumber.trim(),
        movementType: d.movementType?.trim() || 'Automatic',
        movementCaliber: d.movementCaliber?.trim(),
        powerReserve: parseInt_(d.powerReserve, 'powerReserve', rowNum),
        jewels: parseInt_(d.jewels, 'jewels', rowNum),
        caseDiameter: parseNumber(d.caseDiameter, 'caseDiameter', rowNum, true)!,
        caseThickness: parseNumber(d.caseThickness, 'caseThickness', rowNum),
        lugWidth: parseNumber(d.lugWidth, 'lugWidth', rowNum),
        caseMaterial: d.caseMaterial?.trim() || 'Stainless Steel',
        crystalType: d.crystalType?.trim() || 'Sapphire',
        waterResistance: parseNumber(
          d.waterResistance,
          'waterResistance',
          rowNum,
          true
        )!,
        indices: d.indices?.trim(),
        hands: d.hands?.trim(),
        warranty: d.warranty?.trim() || '2 years',
        boxAndPapers: parseBool(d.boxAndPapers, true),
      },
    } as Partial<IProduct>;
  }

  private buildVariantData(
    d: Record<string, string>,
    rowNum: number
  ): Partial<IProductVariant> {
    return {
      _id: new Types.ObjectId(),
      sku: d.sku?.trim().toUpperCase() || undefined,
      dialColor: d.dialColor.trim(),
      dialFinish: d.dialFinish?.trim(),
      caseMaterial: d.caseMaterial.trim(),
      caseSize: parseNumber(d.caseSize, 'caseSize', rowNum, true)!,
      bezelType: d.bezelType?.trim(),
      indicesType: d.indicesType?.trim(),
      strapType: d.strapType.trim(),
      strapColor: d.strapColor.trim(),
      claspType: d.claspType?.trim(),
      movement: (d.movement?.trim() as IProductVariant['movement']) || 'automatic',
      complications: parseList(d.complications),
      price: parseInt_(d.price, 'price', rowNum, true)!,
      compareAtPrice: parseInt_(d.compareAtPrice, 'compareAtPrice', rowNum),
      stock: parseInt_(d.stock, 'stock', rowNum) ?? 0,
      lowStockThreshold: parseInt_(d.lowStockThreshold, 'lowStockThreshold', rowNum) ?? 3,
      images: d.variantImages
        ? d.variantImages.split('|').map((s) => s.trim()).filter(Boolean)
        : [],
      isActive: true,
      weight: parseNumber(d.weight, 'weight', rowNum),
    } as Partial<IProductVariant>;
  }
}

export const csvImportService = new CsvImportService();
