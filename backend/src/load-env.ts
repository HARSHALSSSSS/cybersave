import { createHash } from 'crypto';
import { resolve } from 'path';
import { config as loadDotenv } from 'dotenv';

/**
 * Load backend/.env before Nest reads process.env.
 * MilesWeb/cPanel has no env UI — start with: node dist/main.js
 */
loadDotenv({ path: resolve(process.cwd(), '.env') });

function deriveSecret(label: string): string {
  const source = process.env.APP_SECRET || process.env.DATABASE_URL || 'cybersave-local-dev';
  return createHash('sha256').update(`${source}:${label}:cybersave-v1`).digest('hex');
}

if (process.env.APP_SECRET) {
  process.env.CITIZEN_JWT_SECRET ??= process.env.APP_SECRET;
  process.env.ADMIN_JWT_SECRET ??= process.env.APP_SECRET;
}

if (!process.env.CITIZEN_JWT_SECRET) {
  process.env.CITIZEN_JWT_SECRET = deriveSecret('citizen-jwt');
}

if (!process.env.ADMIN_JWT_SECRET) {
  process.env.ADMIN_JWT_SECRET = deriveSecret('admin-jwt');
}

export function defaultListenPort(): number {
  if (process.env.RENDER) return 10000;
  if (process.env.NODE_ENV === 'production') return 3000;
  return 8000;
}
