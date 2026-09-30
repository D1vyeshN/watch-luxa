import { CONFIG } from '@/constants/config';

export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat(CONFIG.locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat(CONFIG.locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/**
 * Human-readable relative time: "2 hours ago", "3 days ago"
 */
export function formatRelativeTime(date: string | Date): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = Math.floor((now - then) / 1000); // seconds

  const units: Array<[number, string]> = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [7, 'day'],
    [4.34, 'week'],
    [12, 'month'],
  ];

  let value = diff;
  let unit = 'second';

  for (let i = 0; i < units.length; i++) {
    const [divisor, name] = units[i];
    if (Math.abs(value) < divisor) break;
    value = Math.floor(value / divisor);
    unit = units[i + 1]?.[1] ?? 'year';
  }

  const rtf = new Intl.RelativeTimeFormat(CONFIG.locale, { numeric: 'auto' });
  return rtf.format(-value, unit as Intl.RelativeTimeFormatUnit);
}
