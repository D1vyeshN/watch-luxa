// Shape of GET /admin/collections list items — the API maps `_id` to `id`
export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  featured: boolean;
  displayOrder: number;
  productCount: number;
  hasAutoRule: boolean;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}
