'use client';

import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  comparison?: number; // percent change
  comparisonLabel?: string;
  icon?: React.ReactNode;
}

export function StatCard({
  label,
  value,
  comparison,
  comparisonLabel = 'vs previous period',
  icon,
}: StatCardProps) {
  const hasComparison = comparison !== undefined;

  const trend = (() => {
    if (!hasComparison) return 'neutral';
    if (comparison > 0) return 'up';
    if (comparison < 0) return 'down';
    return 'neutral';
  })();

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>

        <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>

        {hasComparison && (
          <div className="mt-3 flex items-center gap-1.5">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-medium',
                trend === 'up' &&
                  'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400',
                trend === 'down' &&
                  'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',
                trend === 'neutral' &&
                  'bg-muted text-muted-foreground'
              )}
            >
              {trend === 'up' && <ArrowUpRight className="h-3 w-3" />}
              {trend === 'down' && <ArrowDownRight className="h-3 w-3" />}
              {trend === 'neutral' && <Minus className="h-3 w-3" />}
              {comparison > 0 ? '+' : ''}
              {comparison.toFixed(1)}%
            </span>
            <span className="text-[11px] text-muted-foreground">
              {comparisonLabel}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
