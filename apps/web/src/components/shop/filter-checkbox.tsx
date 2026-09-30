'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface FilterCheckboxProps {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  count?: number;
}

export function FilterCheckbox({
  label,
  checked,
  onCheckedChange,
  count,
}: FilterCheckboxProps) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center justify-between gap-3 py-2 text-sm transition-colors',
        'text-ink-soft hover:text-forest-900'
      )}
    >
      <div className="flex items-center gap-3">
        <Checkbox
          checked={checked}
          onCheckedChange={(value) => onCheckedChange(Boolean(value))}
          className="rounded-sm border-forest-900/30 data-[state=checked]:border-forest-900 data-[state=checked]:bg-forest-900"
        />
        <span>{label}</span>
      </div>

      {count !== undefined && (
        <span className="text-xs text-ink-muted">{count}</span>
      )}
    </label>
  );
}
