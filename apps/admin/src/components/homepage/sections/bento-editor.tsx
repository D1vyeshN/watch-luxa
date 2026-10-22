'use client';

import { useSelect } from '@refinedev/core';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BENTO_MAX_TILES, type CategoryBentoSection } from '@/types/homepage';
import { ImageField, ItemControls, TextField, listOps } from './fields';

// Matches the storefront grid: tile 1 is the large one, tile 4 spans two columns
const TILE_SHAPE = ['Large', 'Small', 'Small', 'Wide', 'Small', 'Small', 'Small'];

interface Props {
  section: CategoryBentoSection;
  onChange: (section: CategoryBentoSection) => void;
}

export function BentoEditor({ section, onChange }: Props) {
  const { options } = useSelect({
    resource: 'categories',
    optionLabel: 'name',
    optionValue: 'slug',
    pagination: { pageSize: 100 },
  });

  const tiles = section.tiles;
  const setTiles = (next: CategoryBentoSection['tiles']) => onChange({ ...section, tiles: next });
  const used = new Set(tiles.map((t) => t.categorySlug));

  return (
    <div className="space-y-5">
      <TextField label="Title" required max={80} value={section.title} onChange={(v) => onChange({ ...section, title: v ?? '' })} />
      <TextField label="Description" max={200} value={section.description} onChange={(v) => onChange({ ...section, description: v })} />

      <div className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <Label>
              Tiles ({tiles.length}/{BENTO_MAX_TILES})
            </Label>
            <p className="text-xs text-muted-foreground">
              The first tile is the large one. With no tiles, the first categories are shown. A tile without
              its own photo uses the category image.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={tiles.length >= BENTO_MAX_TILES}
            onClick={() => setTiles([...tiles, { categorySlug: '' }])}
          >
            <Plus className="mr-2 h-3.5 w-3.5" />
            Add tile
          </Button>
        </div>

        {tiles.map((tile, i) => (
          <div key={i} className="space-y-3 rounded-md border border-border p-3">
            <div className="flex items-center gap-3">
              <span className="w-12 shrink-0 text-xs text-muted-foreground">{TILE_SHAPE[i]}</span>
              <Select
                value={tile.categorySlug || undefined}
                onValueChange={(slug) => setTiles(listOps.replace(tiles, i, { ...tile, categorySlug: slug }))}
              >
                <SelectTrigger className="flex-1" aria-label={`Tile ${i + 1} category`}>
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {options.map((o) => (
                    <SelectItem
                      key={String(o.value)}
                      value={String(o.value)}
                      // One tile per category
                      disabled={used.has(String(o.value)) && String(o.value) !== tile.categorySlug}
                    >
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ItemControls
                index={i}
                count={tiles.length}
                name={`tile ${i + 1}`}
                onMove={(to) => setTiles(listOps.move(tiles, i, to))}
                onRemove={() => setTiles(listOps.remove(tiles, i))}
              />
            </div>
            <ImageField
              label={`Tile ${i + 1} photo`}
              aspect={i === 3 ? 'wide' : 'square'}
              value={tile.imageUrl}
              onChange={(url) => setTiles(listOps.replace(tiles, i, { ...tile, imageUrl: url }))}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
