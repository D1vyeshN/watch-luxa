'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProductFilters } from '@/lib/filters/useProductFilters';

interface PaginationProps {
  total: number;
  page: number;
  limit: number;
}

export function Pagination({ total, page, limit }: PaginationProps) {
  const { setFilter } = useProductFilters();
  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1) return null;

  const goTo = (p: number) => {
    setFilter('page', p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Build page numbers with ellipsis
  const pages: (number | 'ellipsis')[] = [];
  const windowSize = 1;

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('ellipsis');

    const start = Math.max(2, page - windowSize);
    const end = Math.min(totalPages - 1, page + windowSize);
    for (let i = start; i <= end; i++) pages.push(i);

    if (page < totalPages - 2) pages.push('ellipsis');
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1">
      {/* Previous */}
      <button
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        className="flex h-9 w-9 items-center justify-center border border-forest-900/20 transition-colors hover:border-forest-900 hover:bg-forest-900 hover:text-cream-100 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-forest-900/20 disabled:hover:bg-transparent disabled:hover:text-forest-900"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span
            key={`ellipsis-${i}`}
            className="flex h-9 w-9 items-center justify-center text-xs text-ink-muted"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => goTo(p)}
            className={cn(
              'flex h-9 w-9 items-center justify-center border text-xs transition-colors',
              p === page
                ? 'border-forest-900 bg-forest-900 text-cream-100'
                : 'border-forest-900/20 hover:border-forest-900'
            )}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        className="flex h-9 w-9 items-center justify-center border border-forest-900/20 transition-colors hover:border-forest-900 hover:bg-forest-900 hover:text-cream-100 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-forest-900/20 disabled:hover:bg-transparent disabled:hover:text-forest-900"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
