export interface InventoryRow {
  productId: string;
  productName: string;
  productSlug: string;
  sku: string;
  variantId: string;
  dialColor: string;
  caseMaterial: string;
  caseSize: number;
  strapType: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;
  isLowStock: boolean;
  isOutOfStock: boolean;
}