'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { ProductVariant } from '@/types/catalog';

export interface VariantAttribute {
  key: 'dialColor' | 'caseMaterial' | 'strapType' | 'caseSize';
  label: string;
  values: string[];
}

export interface UseVariantSelectionReturn {
  variants: ProductVariant[];
  attributes: VariantAttribute[];
  selected: Partial<Record<VariantAttribute['key'], string>>;
  currentVariant: ProductVariant | null;
  isValueAvailable: (key: VariantAttribute['key'], value: string) => boolean;
  selectValue: (key: VariantAttribute['key'], value: string) => void;
  hasVariants: boolean;
}

const ATTRIBUTE_LABELS: Record<VariantAttribute['key'], string> = {
  dialColor: 'Dial Colour',
  caseMaterial: 'Case Material',
  strapType: 'Strap',
  caseSize: 'Case Size',
};

export function useVariantSelection(
  variants: ProductVariant[]
): UseVariantSelectionReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Build attribute definition list
  const attributes = useMemo<VariantAttribute[]>(() => {
    const keys: VariantAttribute['key'][] = [
      'dialColor',
      'caseMaterial',
      'strapType',
      'caseSize',
    ];

    return keys
      .map((key) => {
        const values = Array.from(
          new Set(
            variants.map((v) => String(v[key as keyof ProductVariant] ?? ''))
          )
        ).filter(Boolean);

        return {
          key,
          label: ATTRIBUTE_LABELS[key],
          values,
        };
      })
      .filter((attr) => attr.values.length > 1); // only show attributes with choices
  }, [variants]);

  // Read selected values from URL
  const selected = useMemo<
    Partial<Record<VariantAttribute['key'], string>>
  >(() => {
    const result: Partial<Record<VariantAttribute['key'], string>> = {};
    attributes.forEach((attr) => {
      const value = searchParams.get(attr.key);
      if (value && attr.values.includes(value)) {
        result[attr.key] = value;
      }
    });
    return result;
  }, [attributes, searchParams]);

  // Determine the current variant
  const currentVariant = useMemo<ProductVariant | null>(() => {
    if (variants.length === 0) return null;

    // If any attribute is selected, filter variants
    const matches = variants.filter((v) =>
      Object.entries(selected).every(
        ([key, value]) => String(v[key as keyof ProductVariant]) === value
      )
    );

    // Prefer in-stock variant
    return matches.find((v) => v.inStock) ?? matches[0] ?? variants[0];
  }, [variants, selected]);

  // Check if a specific value would have any available variant
  const isValueAvailable = useCallback(
    (key: VariantAttribute['key'], value: string): boolean => {
      const candidates = variants.filter(
        (v) => String(v[key as keyof ProductVariant]) === value
      );

      // With no other filters, check if ANY variant exists with this value
      const otherSelected = Object.entries(selected).filter(
        ([k]) => k !== key
      );

      const filtered = candidates.filter((v) =>
        otherSelected.every(
          ([k, val]) => String(v[k as keyof ProductVariant]) === val
        )
      );

      return filtered.some((v) => v.inStock) || filtered.length > 0;
    },
    [variants, selected]
  );

  // Update URL when a value is selected
  const selectValue = useCallback(
    (key: VariantAttribute['key'], value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (selected[key] === value) {
        // Clicking the same value deselects it
        params.delete(key);
      } else {
        params.set(key, value);
      }

      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
    },
    [searchParams, pathname, router, selected]
  );

  return {
    variants,
    attributes,
    selected,
    currentVariant,
    isValueAvailable,
    selectValue,
    hasVariants: variants.length > 0,
  };
}
