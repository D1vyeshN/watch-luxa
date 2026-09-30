export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  country?: string;
  founded?: number;
  featured?: boolean;
  heritageStory?: string;
  products?: Product[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  displayOrder: number;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  featured: boolean;
  displayOrder: number;
  productCount: number;
  products?: Product[];
}

export interface ProductVariant {
  id: string;
  sku: string;
  dialColor: string;
  dialFinish?: string;
  caseMaterial: string;
  caseSize: number;
  bezelType?: string;
  indicesType?: string;
  strapType: string;
  strapColor: string;
  claspType?: string;
  movement: 'automatic' | 'manual' | 'quartz' | 'solar';
  complications: string[];
  price: number;
  compareAtPrice?: number;
  stock: number;
  inStock: boolean;
  lowStock: boolean;
  images: string[];
  weight?: number;
}

export interface ProductSpecs {
  referenceNumber: string;
  movementType: string;
  movementCaliber?: string;
  powerReserve?: number;
  jewels?: number;
  caseDiameter: number;
  caseThickness?: number;
  lugWidth?: number;
  caseMaterial: string;
  bezelMaterial?: string;
  crystalType: string;
  waterResistance: number;
  indices?: string;
  hands?: string;
  warranty: string;
  boxAndPapers: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: Brand | null;
  category: string;
  gender: 'men' | 'women' | 'unisex';
  shortDescription: string;
  fullDescription?: string;
  story?: string;
  basePrice: number;
  priceRange: { min: number; max: number };
  heroImage: string;
  images: string[];
  video?: string;
  rating: number;
  reviewCount: number;
  isLimitedEdition: boolean;
  limitedQuantity?: number;
  featured: boolean;
  inStock: boolean;
  variantCount: number;
  tags: string[];
  specs?: ProductSpecs;
  variants?: ProductVariant[];
  availableColors?: string[];
  availableMaterials?: string[];
}

export interface ProductFilters {
  search?: string;
  category?: string;
  brandId?: string;
  brandSlug?: string;
  gender?: string;
  movement?: string;
  dialColor?: string;
  caseMaterial?: string;
  caseSize?: string;
  bezelType?: string;
  strapType?: string;
  complications?: string;
  minPrice?: number;
  maxPrice?: number;
  minWaterResistance?: number;
  tags?: string;
  featured?: boolean;
  isLimitedEdition?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
