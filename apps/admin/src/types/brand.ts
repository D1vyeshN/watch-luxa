// Shape of GET /admin/brands list items — the API maps `_id` to `id`
export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  country?: string;
  founded?: number;
  heritagePreview?: string; // first 160 chars; full story via GET /:id
  featured: boolean;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}
