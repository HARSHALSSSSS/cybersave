const crypto = require('crypto');

function deriveSecret(label) {
  const source =
    process.env.APP_SECRET ||
    process.env.DATABASE_URL ||
    'cybersave-local-dev';
  return crypto
    .createHash('sha256')
    .update(`${source}:${label}:cybersave-v1`)
    .digest('hex');
}

/**
 * Manual Render deploys often only set DATABASE_URL.
 * Derive stable JWT secrets from DATABASE_URL so the API boots without extra env vars.
 * Override anytime with CITIZEN_JWT_SECRET / ADMIN_JWT_SECRET / APP_SECRET.
 */
function ensureProductionEnv() {
  if (process.env.APP_SECRET) {
    if (!process.env.CITIZEN_JWT_SECRET) {
      process.env.CITIZEN_JWT_SECRET = process.env.APP_SECRET;
    }
    if (!process.env.ADMIN_JWT_SECRET) {
      process.env.ADMIN_JWT_SECRET = process.env.APP_SECRET;
    }
  }

  if (!process.env.CITIZEN_JWT_SECRET) {
    process.env.CITIZEN_JWT_SECRET = deriveSecret('citizen-jwt');
    console.log(
      '[cybersave] CITIZEN_JWT_SECRET not set — using value derived from DATABASE_URL',
    );
  }

  if (!process.env.ADMIN_JWT_SECRET) {
    process.env.ADMIN_JWT_SECRET = deriveSecret('admin-jwt');
    console.log(
      '[cybersave] ADMIN_JWT_SECRET not set — using value derived from DATABASE_URL',
    );
  }
}

module.exports = { ensureProductionEnv };
