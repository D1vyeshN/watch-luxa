import type { Product, Brand } from './catalog';

export interface SearchResult {
  products: Product[];
  brands: Brand[];
  total: number;
}

export interface AutocompleteSuggestion {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  brand: string;
}
