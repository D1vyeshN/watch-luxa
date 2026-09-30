import type { Product, Brand, Category, Collection } from './catalog';

export interface HomeData {
  featured: Product[];
  newArrivals: Product[];
  trending: Product[];
  categories: Category[];
  brands: Brand[];
  collections: Collection[];
}
