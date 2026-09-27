/**
 * Build MongoDB filter for public product listing.
 * Only returns active products with active variants.
 * Supports all filter dimensions a watch buyer needs.
 */
export const buildPublicProductFilter = (
  query: Record<string, unknown>
): Record<string, unknown> => {
  const filter: Record<string, unknown> = {
    status: 'active',
    'variants.isActive': true,
  };

  // ─── Direct product-level filters ───
  if (query.category) filter.category = query.category;
  if (query.brandId) filter.brandId = query.brandId;
  if (query.brandSlug) filter['brand.slug'] = query.brandSlug; // handled via lookup
  if (query.gender) filter.gender = query.gender;
  if (query.collectionId) filter.collectionIds = query.collectionId;

  // ─── Featured / limited ───
  if (query.featured === 'true' || query.featured === true) {
    filter.featured = true;
  }
  if (query.isLimitedEdition === 'true' || query.isLimitedEdition === true) {
    filter.isLimitedEdition = true;
  }

  // ─── Price range ───
  if (query.minPrice || query.maxPrice) {
    filter.basePrice = {};
    if (query.minPrice) (filter.basePrice as any).$gte = Number(query.minPrice);
    if (query.maxPrice) (filter.basePrice as any).$lte = Number(query.maxPrice);
  }

  // ─── Multi-select variant filters ───
  const variantFilters = [
    'movement',
    'dialColor',
    'caseMaterial',
    'caseSize',
    'bezelType',
    'strapType',
    'strapColor',
    'indicesType',
  ];

  variantFilters.forEach((field) => {
    if (query[field]) {
      const value = query[field];
      if (typeof value === 'string' && value.includes(',')) {
        filter[`variants.${field}`] = { $in: value.split(',').map((s) => s.trim()) };
      } else {
        filter[`variants.${field}`] = value;
      }
    }
  });

  // ─── Case size (numeric range) ───
  if (query.minCaseSize || query.maxCaseSize) {
    filter['variants.caseSize'] = {};
    if (query.minCaseSize)
      (filter['variants.caseSize'] as any).$gte = Number(query.minCaseSize);
    if (query.maxCaseSize)
      (filter['variants.caseSize'] as any).$lte = Number(query.maxCaseSize);
  }

  // ─── Complications (array — must contain all) ───
  if (query.complications) {
    filter['variants.complications'] = {
      $all: String(query.complications).split(',').map((s) => s.trim()),
    };
  }

  // ─── Water resistance (spec-level) ───
  if (query.minWaterResistance) {
    filter['specs.waterResistance'] = {
      $gte: Number(query.minWaterResistance),
    };
  }

  // ─── Tags ───
  if (query.tags) {
    filter.tags = { $in: String(query.tags).split(',').map((s) => s.trim()) };
  }

  // ─── Full-text search ───
  if (query.search) {
    filter.$text = { $search: String(query.search) };
  }

  return filter;
};

/**
 * Transform a product document into a customer-friendly storefront shape.
 * Strips internal fields, simplifies nested structures.
 */
export const toStorefrontProduct = (product: any, includeVariants = false) => {
  const activeVariants = (product.variants || []).filter((v: any) => v.isActive);

  const prices = activeVariants.map((v: any) => v.price);
  const totalStock = activeVariants.reduce((sum: number, v: any) => sum + v.stock, 0);

  const base: Record<string, unknown> = {
    id: product._id,
    name: product.name,
    slug: product.slug,
    brand: product.brandId
      ? {
          id: product.brandId._id,
          name: product.brandId.name,
          slug: product.brandId.slug,
          logo: product.brandId.logo,
        }
      : null,
    category: product.category,
    gender: product.gender,
    shortDescription: product.shortDescription,
    basePrice: product.basePrice,
    priceRange: {
      min: prices.length ? Math.min(...prices) : product.basePrice,
      max: prices.length ? Math.max(...prices) : product.basePrice,
    },
    heroImage: product.heroImage,
    images: (product.images || []).slice(0, 4), // limit for list views
    rating: product.rating,
    reviewCount: product.reviewCount,
    isLimitedEdition: product.isLimitedEdition,
    limitedQuantity: product.limitedQuantity,
    featured: product.featured,
    inStock: totalStock > 0,
    variantCount: activeVariants.length,
    tags: product.tags || [],
  };

  // List view filters available variants
  if (!includeVariants) {
    base.availableColors = [
      ...new Set(activeVariants.map((v: any) => v.dialColor)),
    ];
    base.availableMaterials = [
      ...new Set(activeVariants.map((v: any) => v.caseMaterial)),
    ];
    return base;
  }

  // Detail view includes everything
  return {
    ...base,
    fullDescription: product.fullDescription,
    story: product.story,
    video: product.video,
    images: product.images || [],
    specs: product.specs,
    variants: activeVariants.map((v: any) => ({
      id: v._id,
      sku: v.sku,
      dialColor: v.dialColor,
      dialFinish: v.dialFinish,
      caseMaterial: v.caseMaterial,
      caseSize: v.caseSize,
      bezelType: v.bezelType,
      indicesType: v.indicesType,
      strapType: v.strapType,
      strapColor: v.strapColor,
      claspType: v.claspType,
      movement: v.movement,
      complications: v.complications,
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      stock: v.stock,
      inStock: v.stock > 0,
      lowStock: v.stock > 0 && v.stock <= v.lowStockThreshold,
      images: v.images,
      weight: v.weight,
    })),
  };
};

/**
 * Transform a brand for public display.
 */
export const toStorefrontBrand = (brand: any, includeHeritage = false) => {
  const base: Record<string, unknown> = {
    id: brand._id,
    name: brand.name,
    slug: brand.slug,
    logo: brand.logo,
    country: brand.country,
    founded: brand.founded,
    featured: brand.featured,
  };

  if (includeHeritage) {
    base.heritageStory = brand.heritageStory;
  }

  return base;
};

/**
 * Transform a category for public display.
 */
export const toStorefrontCategory = (category: any) => ({
  id: category._id,
  name: category.name,
  slug: category.slug,
  description: category.description,
  image: category.image,
  icon: category.icon,
  displayOrder: category.displayOrder,
});

/**
 * Transform a collection for public display.
 */
export const toStorefrontCollection = (collection: any) => ({
  id: collection._id,
  name: collection.name,
  slug: collection.slug,
  description: collection.description,
  image: collection.image,
  featured: collection.featured,
  displayOrder: collection.displayOrder,
  productCount: collection.productIds?.length || 0,
});
