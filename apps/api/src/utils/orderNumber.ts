import crypto from 'crypto';

/**
 * Generate a human-readable order number.
 * Format: LUX-YYMMDD-XXXX
 * Example: LUX-260928-A3F7
 */
export const generateOrderNumber = (): string => {
  const now = new Date();
  const y = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');

  const random = crypto.randomBytes(2).toString('hex').toUpperCase();

  return `LUX-${y}${m}${d}-${random}`;
};
