'use client';

import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { FilterSidebar } from './filter-sidebar';
import { useProductFilters } from '@/lib/filters/useProductFilters';

export function MobileFilterButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { activeFilterCount } = useProductFilters();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 border border-forest-900/20 bg-cream-50 px-4 py-2 text-xs uppercase tracking-[0.14em] text-forest-900 lg:hidden"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filters
        {activeFilterCount > 0 && (
          <span className="ml-1 rounded-full bg-forest-900 px-1.5 py-0.5 text-[9px] text-cream-100">
            {activeFilterCount}
          </span>
        )}
      </button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="left"
          className="w-full overflow-y-auto border-r-0 bg-cream-100 p-0 sm:max-w-sm"
        >
          <SheetHeader className="border-b border-forest-900/10 px-6 py-5">
            <SheetTitle className="text-xs uppercase tracking-[0.18em] text-forest-900">
              Filters
            </SheetTitle>
          </SheetHeader>
          <div className="px-6 py-6">
            <FilterSidebar />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
