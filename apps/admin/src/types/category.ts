// Shape of GET /admin/categories list items — the API maps `_id` to `id`
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  displayOrder: number;
  isSystem: boolean;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}
