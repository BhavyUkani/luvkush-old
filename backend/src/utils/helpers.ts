import crypto from 'crypto';

export function generateSlug(text: string): string {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  // Non-Latin names (e.g. Hindi) strip to an empty string under \w — fall
  // back to a short random slug rather than shipping a broken product URL.
  return slug || `item-${Math.random().toString(36).substring(2, 8)}`;
}

export function generateSku(name: string, categoryId: number): string {
  const prefix = name
    .split(' ')
    .map(w => w[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 3);
  const random = randomToken(6);
  return `LK-${prefix}-${categoryId}-${random}`;
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

/** Cryptographically random, uppercase base36 token — used anywhere a
 * collision against a UNIQUE column (order numbers, SKUs) must be rare
 * enough that a caller-side retry is realistic rather than routine. */
export function randomToken(length: number): string {
  return crypto.randomBytes(length)
    .toString('hex')
    .replace(/[^0-9a-f]/g, '')
    .toUpperCase()
    .slice(0, length);
}
