'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { generateSku } from '@/lib/sku';
import { variantMatrixSchema } from '@/lib/validation/product';
import type { ProductFormVariant } from '@/types/product-form';

interface VariantMatrixModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (variants: ProductFormVariant[]) => void;
  brandName?: string;
  initialPrice?: number; // rupees
}

const DIAL_COLORS = ['Black', 'White', 'Blue', 'Green', 'Brown', 'Silver', 'Salmon', 'Red'];
const CASE_MATERIALS = ['Oystersteel', 'Titanium', 'Yellow Gold', 'Rose Gold', 'White Gold', 'Platinum', 'Ceramic'];
const STRAP_TYPES = ['Oyster Bracelet', 'Jubilee Bracelet', 'Leather', 'Rubber', 'NATO', 'Mesh'];
const CASE_SIZES = [36, 38, 40, 41, 42, 44];

// Metal bracelets take the case material's colour; straps default to black
const METAL_STRAPS = ['Oyster Bracelet', 'Jubilee Bracelet', 'Mesh'];
const strapColorFor = (strapType: string, caseMaterial: string) =>
  METAL_STRAPS.includes(strapType) ? caseMaterial : 'Black';

const toggle = <T,>(list: T[], value: T): T[] =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

export function VariantMatrixModal({
  open,
  onOpenChange,
  onGenerate,
  brandName = '',
  initialPrice = 0,
}: VariantMatrixModalProps) {
  const [dialColors, setDialColors] = useState<string[]>(['Black']);
  const [caseMaterials, setCaseMaterials] = useState<string[]>(['Oystersteel']);
  const [strapTypes, setStrapTypes] = useState<string[]>(['Oyster Bracelet']);
  const [caseSizes, setCaseSizes] = useState<number[]>([41]);
  const [defaultPrice, setDefaultPrice] = useState<number | undefined>(initialPrice);
  const [defaultStock, setDefaultStock] = useState<number | undefined>(0);
  const [movement, setMovement] = useState<ProductFormVariant['movement']>('automatic');

  const combinationCount =
    dialColors.length * caseMaterials.length * strapTypes.length * caseSizes.length;

  const handleGenerate = () => {
    const parsed = variantMatrixSchema.safeParse({
      dialColors,
      caseMaterials,
      strapTypes,
      caseSizes,
      defaultPrice,
      defaultStock,
      movement,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    const m = parsed.data;
    const variants: ProductFormVariant[] = [];

    for (const dialColor of m.dialColors) {
      for (const caseMaterial of m.caseMaterials) {
        for (const strapType of m.strapTypes) {
          for (const caseSize of m.caseSizes) {
            variants.push({
              sku: brandName
                ? generateSku(brandName, { dialColor, caseMaterial, strapType, caseSize })
                : '', // no brand yet → API generates it on save
              dialColor,
              caseMaterial,
              caseSize,
              strapType,
              strapColor: strapColorFor(strapType, caseMaterial),
              movement: m.movement,
              complications: [],
              price: m.defaultPrice, // rupees; converted to paise on submit
              stock: m.defaultStock,
              lowStockThreshold: 3,
              images: [],
              isActive: true,
            });
          }
        }
      }
    }

    onGenerate(variants);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cream-600" />
            Generate Variant Matrix
          </DialogTitle>
          <DialogDescription>
            Select the attributes. Every combination becomes a variant with a
            unique SKU.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* ─── Dial Colors ─── */}
          <div>
            <Label className="mb-3 block text-xs uppercase tracking-[0.14em]">
              Dial Colors
            </Label>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {DIAL_COLORS.map((color) => (
                <label key={color} className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox
                    checked={dialColors.includes(color)}
                    onCheckedChange={() => setDialColors(toggle(dialColors, color))}
                  />
                  {color}
                </label>
              ))}
            </div>
          </div>

          {/* ─── Case Materials ─── */}
          <div>
            <Label className="mb-3 block text-xs uppercase tracking-[0.14em]">
              Case Materials
            </Label>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {CASE_MATERIALS.map((mat) => (
                <label key={mat} className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox
                    checked={caseMaterials.includes(mat)}
                    onCheckedChange={() => setCaseMaterials(toggle(caseMaterials, mat))}
                  />
                  {mat}
                </label>
              ))}
            </div>
          </div>

          {/* ─── Strap Types ─── */}
          <div>
            <Label className="mb-3 block text-xs uppercase tracking-[0.14em]">
              Strap Types
            </Label>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {STRAP_TYPES.map((strap) => (
                <label key={strap} className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox
                    checked={strapTypes.includes(strap)}
                    onCheckedChange={() => setStrapTypes(toggle(strapTypes, strap))}
                  />
                  {strap}
                </label>
              ))}
            </div>
          </div>

          {/* ─── Case Sizes ─── */}
          <div>
            <Label className="mb-3 block text-xs uppercase tracking-[0.14em]">
              Case Sizes
            </Label>
            <div className="flex flex-wrap gap-2">
              {CASE_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  aria-pressed={caseSizes.includes(size)}
                  onClick={() => setCaseSizes(toggle(caseSizes, size))}
                  className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                    caseSizes.includes(size)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:border-foreground'
                  }`}
                >
                  {size}mm
                </button>
              ))}
            </div>
          </div>

          {/* ─── Defaults ─── */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="mb-2 block text-xs uppercase tracking-[0.14em]">
                Default Price (₹)
              </Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={defaultPrice ?? ''}
                onChange={(e) =>
                  setDefaultPrice(e.target.value === '' ? undefined : e.target.valueAsNumber)
                }
              />
            </div>

            <div>
              <Label className="mb-2 block text-xs uppercase tracking-[0.14em]">
                Default Stock
              </Label>
              <Input
                type="number"
                min={0}
                value={defaultStock ?? ''}
                onChange={(e) =>
                  setDefaultStock(e.target.value === '' ? undefined : e.target.valueAsNumber)
                }
              />
            </div>

            <div>
              <Label className="mb-2 block text-xs uppercase tracking-[0.14em]">
                Movement
              </Label>
              <Select
                value={movement}
                onValueChange={(v) => setMovement(v as ProductFormVariant['movement'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automatic">Automatic</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="quartz">Quartz</SelectItem>
                  <SelectItem value="solar">Solar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ─── Preview ─── */}
          <div className="rounded-md border border-cream-600/30 bg-cream-600/5 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-foreground">
                Combinations to generate
              </span>
              <span className="text-2xl font-semibold text-foreground">
                {combinationCount}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {brandName
                ? 'Each combination gets a unique auto-generated SKU.'
                : 'Pick a brand on the Basic tab to preview SKUs — otherwise they are generated on save.'}{' '}
              You can edit price and stock individually after generation.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleGenerate} disabled={combinationCount === 0}>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate {combinationCount} Variants
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
