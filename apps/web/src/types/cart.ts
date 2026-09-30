export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  sku: string;
  productName: string;
  productSlug: string;
  variantLabel: string;
  image: string;
  quantity: number;
  price: number;
  priceAtAdd: number;
  priceChanged: boolean;
  lineTotal: number;
  stock: number;
  isAvailable: boolean;
  issues?: string[];
}

export interface Cart {
  id: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  total: number;
  couponCode?: string;
  currency: string;
  hasIssues: boolean;
}
