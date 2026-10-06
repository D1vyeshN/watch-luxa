export interface ProductBrand {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
}

export interface ProductVariant {
  _id: string;
  sku: string;
  dialColor: string;
  caseMaterial: string;
  caseSize: number;
  strapType: string;
  price: number;
  stock: number;
  isActive: boolean;
}

// Shape of GET /admin/products list items — the API maps `_id` to `id`
export interface Product {
  id: string;
  name: string;
  slug: string;
  brand?: ProductBrand;
  category: string;
  status: 'draft' | 'active' | 'archived';
  basePrice: number;
  heroImage: string;
  variantCount: number;
  totalStock: number;
  lowStockCount: number;
  featured: boolean;
  isLimitedEdition: boolean;
  soldCount: number;
  createdAt: string;
  updatedAt: string;
}
