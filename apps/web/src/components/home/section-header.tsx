import Link from 'next/link';

interface SectionHeaderProps {
  title: string;
  description?: string;
  viewAll?: { label?: string; href: string };
}

// Shared heading row for homepage sections. "View all" stays visible on
// phones too — it's the only route from a 4-item rail to the full list.
export function SectionHeader({ title, description, viewAll }: SectionHeaderProps) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6 md:mb-12">
      <div className="min-w-0">
        <h2 className="heading-luxe text-3xl md:text-4xl">{title}</h2>
        {description && (
          <p className="mt-2 max-w-md text-sm text-ink-soft md:text-base">{description}</p>
        )}
      </div>

      {viewAll && (
        <Link
          href={viewAll.href}
          className="shrink-0 border-b border-forest-900/30 py-1 text-xs uppercase tracking-[0.18em] text-forest-900 transition-colors hover:border-forest-900"
        >
          {viewAll.label ?? 'View all'}
        </Link>
      )}
    </div>
  );
}
