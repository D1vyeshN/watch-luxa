import { CONFIG } from '@/constants/config';

/**
 * Format a price stored in paise to a display string.
 * Example: 850000 → "₹8,500"
 */
export function formatPrice(
  amountInPaise: number,
  currency = CONFIG.currency,
  locale = CONFIG.locale
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountInPaise / 100);
}

/**
 * Compact format for cards where space is tight.
 * Example: 8500000 → "₹85K", 85000000 → "₹8.5L"
 */
export function formatPriceCompact(amountInPaise: number): string {
  const rupees = amountInPaise / 100;

  if (rupees >= 1_00_00_000) {
    return `₹${(rupees / 1_00_00_000).toFixed(1).replace(/\.0$/, '')}Cr`;
  }
  if (rupees >= 1_00_000) {
    return `₹${(rupees / 1_00_000).toFixed(1).replace(/\.0$/, '')}L`;
  }
  if (rupees >= 1_000) {
    return `₹${(rupees / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return `₹${rupees.toFixed(0)}`;
}

/**
 * Format a range: "₹8,500 – ₹12,000" or a single price.
 */
export function formatPriceRange(min: number, max: number): string {
  if (min === max) return formatPrice(min);
  return `${formatPrice(min)} – ${formatPrice(max)}`;
}

/**
 * Calculate discount percentage.
 */
export function discountPercent(
  price: number,
  compareAtPrice?: number
): number | null {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}
