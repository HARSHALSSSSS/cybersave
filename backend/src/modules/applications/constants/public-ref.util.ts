import { randomInt } from 'crypto';

const REF_PREFIX = 'CS';

/**
 * Generates a human-readable public reference, e.g. CS-2026-9024.
 */
export function generateApplicationPublicRef(date = new Date()): string {
  const year = date.getFullYear();
  const suffix = randomInt(1000, 10000);
  return `${REF_PREFIX}-${year}-${suffix}`;
}
