export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'checkbox' | 'range';
  options?: FilterOption[];
}

export const FILTER_CONFIG: FilterConfig[] = [
  {
    key: 'gender',
    label: 'Gender',
    type: 'checkbox',
    options: [
      { value: 'men', label: 'Men' },
      { value: 'women', label: 'Women' },
      { value: 'unisex', label: 'Unisex' },
    ],
  },
  {
    key: 'movement',
    label: 'Movement',
    type: 'checkbox',
    options: [
      { value: 'automatic', label: 'Automatic' },
      { value: 'manual', label: 'Manual' },
      { value: 'quartz', label: 'Quartz' },
      { value: 'solar', label: 'Solar' },
    ],
  },
  {
    key: 'dialColor',
    label: 'Dial Colour',
    type: 'checkbox',
    options: [
      { value: 'Black', label: 'Black' },
      { value: 'Blue', label: 'Blue' },
      { value: 'Green', label: 'Green' },
      { value: 'White', label: 'White' },
      { value: 'Brown', label: 'Brown' },
      { value: 'Silver', label: 'Silver' },
      { value: 'Salmon', label: 'Salmon' },
    ],
  },
  {
    key: 'caseMaterial',
    label: 'Case Material',
    type: 'checkbox',
    options: [
      { value: 'Oystersteel', label: 'Stainless Steel' },
      { value: 'Titanium', label: 'Titanium' },
      { value: 'Yellow Gold', label: 'Yellow Gold' },
      { value: 'Rose Gold', label: 'Rose Gold' },
      { value: 'White Gold', label: 'White Gold' },
      { value: 'Platinum', label: 'Platinum' },
      { value: 'Ceramic', label: 'Ceramic' },
    ],
  },
  {
    key: 'caseSize',
    label: 'Case Size',
    type: 'checkbox',
    options: [
      { value: '36', label: '36 mm' },
      { value: '38', label: '38 mm' },
      { value: '40', label: '40 mm' },
      { value: '41', label: '41 mm' },
      { value: '42', label: '42 mm' },
      { value: '44', label: '44 mm' },
    ],
  },
  {
    key: 'strapType',
    label: 'Strap Type',
    type: 'checkbox',
    options: [
      { value: 'Oyster Bracelet', label: 'Metal Bracelet' },
      { value: 'Leather', label: 'Leather' },
      { value: 'Rubber', label: 'Rubber' },
      { value: 'NATO', label: 'NATO' },
      { value: 'Mesh', label: 'Mesh' },
    ],
  },
  {
    key: 'bezelType',
    label: 'Bezel',
    type: 'checkbox',
    options: [
      { value: "Diver's", label: "Diver's" },
      { value: 'GMT', label: 'GMT' },
      { value: 'Tachymeter', label: 'Tachymeter' },
      { value: 'Plain', label: 'Plain' },
      { value: 'Fluted', label: 'Fluted' },
    ],
  },
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]['value'];

export function getSortParams(
  sort: SortOption | string
): { sortBy: string; sortOrder: 'asc' | 'desc' } {
  switch (sort) {
    case 'price_asc':
      return { sortBy: 'basePrice', sortOrder: 'asc' };
    case 'price_desc':
      return { sortBy: 'basePrice', sortOrder: 'desc' };
    case 'popular':
      return { sortBy: 'soldCount', sortOrder: 'desc' };
    case 'newest':
    default:
      return { sortBy: 'createdAt', sortOrder: 'desc' };
  }
}
