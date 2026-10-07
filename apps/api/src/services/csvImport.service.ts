import mongoose, { Types } from 'mongoose';
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
  parseFailed?: boolean;
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
    const { preview } = await this.buildPreview(rows);
    return preview;
  }

  /**
   * Full import. Same as preview but persists to database in a transaction.
   */
  async import(buffer: Buffer): Promise<ImportResult> {
    const { rows } = parseCsvBuffer(buffer);
    // Groups come back with brandId and generated SKUs already attached
    const { preview, groups } = await this.buildPreview(rows);

    if (preview.errors.length > 0) {
      throw new BadRequestError(
        `Import aborted: ${preview.errors.length} validation errors. Fix and retry.`
      );
    }

    let importedProducts = 0;
    let importedVariants = 0;

    // All-or-nothing: any failure rolls back every product created so far
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        importedProducts = 0;
        importedVariants = 0;
        for (const group of groups) {
          group.productData.variants = group.variants as IProductVariant[];
          await Product.create([group.productData], { session });
          importedProducts++;
          importedVariants += group.variants.length;
        }
      });
    } finally {
      await session.endSession();
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

  private groupRows(rows: ParsedCsvRow[]): {
    groups: GroupedProduct[];
    errors: ValidationError[];
  } {
    const groups = new Map<string, GroupedProduct>();
    const errors: ValidationError[] = [];

    for (const row of rows) {
      const d = row.data;
      const ref = d.referenceNumber?.trim();

      if (!ref) {
        errors.push({
          row: row.rowNumber,
          field: 'referenceNumber',
          message: 'referenceNumber is required',
        });
        continue;
      }

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

      // The parse helpers throw on the first bad cell. Collect it as a row
      // error instead, so the preview can list every problem in the file.
      try {
        // Product-level fields — first row wins
        if (Object.keys(group.productData).length === 0) {
          group.productData = this.buildProductData(d, row.rowNumber);
        }

        // Variant — every row
        group.variants.push(this.buildVariantData(d, row.rowNumber));
        group.rowNumbers.push(row.rowNumber);
      } catch (err) {
        if (!(err instanceof BadRequestError)) throw err;
        group.parseFailed = true;
        errors.push({
          row: row.rowNumber,
          field: err.message.match(/"(\w+)"/)?.[1] ?? 'row',
          message: err.message.replace(/^Row \d+: /, ''),
        });
      }
    }

    return { groups: Array.from(groups.values()), errors };
  }

  // ─────────────────────────────────────────────────────────
  // PREVIEW BUILDER
  // ─────────────────────────────────────────────────────────

  private async buildPreview(
    rows: ParsedCsvRow[]
  ): Promise<{ preview: ImportPreview; groups: GroupedProduct[] }> {
    const warnings: string[] = [];

    // 1. Group by reference number (collects per-row parse errors)
    const { groups, errors } = this.groupRows(rows);

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
    const skuRows = new Map<string, number>();
    const seenSlugs = new Set<string>();

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

      // 3c. Slug is unique in the schema — two products with the same name
      // (in the CSV or already in the DB) would fail mid-import
      const slug = group.productData.slug;
      if (slug) {
        if (seenSlugs.has(slug)) {
          errors.push({
            row: group.rowNumbers[0],
            field: 'productName',
            message: `Another product in this CSV has the same name (slug "${slug}")`,
          });
        } else if (await Product.exists({ slug })) {
          errors.push({
            row: group.rowNumbers[0],
            field: 'productName',
            message: `A product with slug "${slug}" already exists`,
          });
        }
        seenSlugs.add(slug);
      }

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
        skuRows.set(variant.sku!, rowNum);
      }

      // 3g. Run the Mongoose schema validators (enums, required, min/max) now,
      // so bad values show up here instead of failing the import transaction.
      // Groups with parse errors are skipped — those rows already have errors.
      if (!group.parseFailed) {
        const validationError = new Product({
          ...group.productData,
          variants: group.variants,
        }).validateSync();

        for (const [path, err] of Object.entries(validationError?.errors ?? {})) {
          // Nested errors are reported on the leaf path too — skip the parent
          if (err.name !== 'ValidatorError' && err.name !== 'CastError') continue;
          const variantMatch = path.match(/^variants\.(\d+)\.(.+)$/);
          errors.push({
            row: variantMatch
              ? group.rowNumbers[Number(variantMatch[1])]
              : group.rowNumbers[0],
            field: variantMatch ? variantMatch[2] : path.replace(/^specs\./, ''),
            message: err.message,
          });
        }
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
              row: skuRows.get(variant.sku) ?? 0,
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

    errors.sort((a, b) => a.row - b.row);

    return {
      preview: {
        totalRows: rows.length,
        totalProducts: groups.length,
        totalVariants: groups.reduce((sum, g) => sum + g.variants.length, 0),
        products,
        errors,
        warnings,
      },
      groups,
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
