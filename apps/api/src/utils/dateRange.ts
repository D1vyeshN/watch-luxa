export type DateRangePreset =
  | '7d'
  | '30d'
  | '90d'
  | 'ytd'
  | 'today'
  | 'custom';

export interface DateRange {
  from: Date;
  to: Date;
  preset: DateRangePreset;
  previousFrom: Date;
  previousTo: Date;
}

export const getDateRange = (query: {
  preset?: string;
  from?: string;
  to?: string;
}): DateRange => {
  const now = new Date();
  const to = query.to ? new Date(query.to) : now;
  let from: Date;
  let preset: DateRangePreset;

  if (query.from && query.to) {
    from = new Date(query.from);
    preset = 'custom';
  } else {
    preset = (query.preset as DateRangePreset) || '30d';

    switch (preset) {
      case 'today': {
        from = new Date(now);
        from.setHours(0, 0, 0, 0);
        break;
      }
      case '7d':
        from = new Date(now);
        from.setDate(from.getDate() - 7);
        break;
      case '90d':
        from = new Date(now);
        from.setDate(from.getDate() - 90);
        break;
      case 'ytd':
        from = new Date(now.getFullYear(), 0, 1);
        break;
      case '30d':
      default:
        from = new Date(now);
        from.setDate(from.getDate() - 30);
    }
  }

  // Previous period of same length
  const spanMs = to.getTime() - from.getTime();
  const previousTo = new Date(from.getTime() - 1);
  const previousFrom = new Date(from.getTime() - spanMs);

  return { from, to, preset, previousFrom, previousTo };
};

export const toDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const percentChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
};
