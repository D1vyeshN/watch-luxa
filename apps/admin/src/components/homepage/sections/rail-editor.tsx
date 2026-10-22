'use client';

import { useSelect } from '@refinedev/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductPicker } from '@/components/collections/product-picker';
import {
  RAIL_MAX_LIMIT,
  RAIL_MAX_MANUAL,
  RAIL_SOURCE_LABELS,
  type ProductRailSection,
  type ProductRailSource,
} from '@/types/homepage';
import { LinkField, TextField } from './fields';

const SOURCE_HINTS: Record<ProductRailSource, string> = {
  featured: 'Products marked “Featured”, newest first.',
  newest: 'Most recently published products.',
  bestselling: 'Products with sales, most sold first. Hidden until something has sold.',
  collection: 'The collection’s products, in the collection’s own order.',
  manual: 'Exactly the products you pick, in your order.',
};

interface Props {
  section: ProductRailSection;
  onChange: (section: ProductRailSection) => void;
}

export function RailEditor({ section, onChange }: Props) {
  const { options: collections } = useSelect({
    resource: 'collections',
    optionLabel: 'name',
    optionValue: 'id',
    pagination: { pageSize: 100 },
  });

  // Keep only the field the chosen source uses, so stale picks aren't saved
  const setSource = (source: ProductRailSource) =>
    onChange({
      ...section,
      source,
      collectionId: source === 'collection' ? section.collectionId : undefined,
      productIds: source === 'manual' ? (section.productIds ?? []) : undefined,
    });

  return (
    <div className="space-y-5">
      <TextField label="Title" required max={80} value={section.title} onChange={(v) => onChange({ ...section, title: v ?? '' })} />
      <TextField label="Description" max={200} value={section.description} onChange={(v) => onChange({ ...section, description: v })} />

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_140px]">
        <div className="space-y-1.5">
          <Label>Products from</Label>
          <Select value={section.source} onValueChange={(v) => setSource(v as ProductRailSource)}>
            <SelectTrigger className="w-full" aria-label="Products from">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(RAIL_SOURCE_LABELS) as ProductRailSource[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {RAIL_SOURCE_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{SOURCE_HINTS[section.source]}</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${section.id}-limit`}>Show</Label>
          <Input
            id={`${section.id}-limit`}
            type="number"
            min={1}
            max={RAIL_MAX_LIMIT}
            value={section.limit}
            onChange={(e) => onChange({ ...section, limit: Number(e.target.value) || 0 })}
          />
          <p className="text-xs text-muted-foreground">4 fills one row on desktop.</p>
        </div>
      </div>

      {section.source === 'collection' && (
        <div className="space-y-1.5">
          <Label>Collection</Label>
          <Select
            value={section.collectionId}
            onValueChange={(id) => onChange({ ...section, collectionId: id })}
          >
            <SelectTrigger className="w-full" aria-label="Collection">
              <SelectValue placeholder="Choose a collection" />
            </SelectTrigger>
            <SelectContent>
              {collections.map((o) => (
                <SelectItem key={String(o.value)} value={String(o.value)}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {section.source === 'manual' && (
        <div className="space-y-1.5">
          <Label>
            Products ({section.productIds?.length ?? 0}/{RAIL_MAX_MANUAL})
          </Label>
          <ProductPicker
            value={section.productIds ?? []}
            onChange={(ids) => onChange({ ...section, productIds: ids.slice(0, RAIL_MAX_MANUAL) })}
          />
        </div>
      )}

      <LinkField label="“View all” link" value={section.viewAll} onChange={(v) => onChange({ ...section, viewAll: v })} />
    </div>
  );
}
