import crypto from 'crypto';

/**
 * Generate a human-readable return number.
 * Format: RET-YYMMDD-XXXX
 * Example: RET-260928-B7K2
 */
export const generateReturnNumber = (): string => {
  const now = new Date();
  const y = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');

  const random = crypto.randomBytes(2).toString('hex').toUpperCase();

  return `RET-${y}${m}${d}-${random}`;
};
