export function formatPrice(amountInPaise: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountInPaise / 100);
}

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

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value);
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}
