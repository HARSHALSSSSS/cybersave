import { registerAs } from '@nestjs/config';

export function parseListenPort(raw: string | undefined, fallback = 8000): number {
  const trimmed = (raw ?? '').trim();
  const parsed = trimmed ? Number.parseInt(trimmed, 10) : fallback;
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 65535) {
    return fallback;
  }
  return parsed;
}

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseListenPort(process.env.PORT, process.env.RENDER ? 10000 : 8000),
  apiPrefix: process.env.API_PREFIX ?? 'api/v1',
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173,http://localhost:5174,http://localhost:8081').split(','),
  swaggerEnabled: process.env.SWAGGER_ENABLED !== 'false',
  skipPaymentVerification: process.env.SKIP_PAYMENT_VERIFICATION === 'true',
}));

export const databaseConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL,
}));

export const redisConfig = registerAs('redis', () => ({
  url: process.env.REDIS_URL ?? 'redis://localhost:6379',
}));

export const citizenAuthConfig = registerAs('citizenAuth', () => ({
  jwtSecret: process.env.CITIZEN_JWT_SECRET,
  jwtExpiresIn: process.env.CITIZEN_JWT_EXPIRES_IN ?? '15m',
  jwtAudience: process.env.CITIZEN_JWT_AUDIENCE ?? 'cybersave-mobile',
  refreshTokenExpiresDays: parseInt(
    process.env.CITIZEN_REFRESH_TOKEN_EXPIRES_DAYS ?? '30',
    10,
  ),
  otpExpiresMinutes: parseInt(process.env.OTP_EXPIRES_MINUTES ?? '5', 10),
  otpLength: parseInt(process.env.OTP_LENGTH ?? '6', 10),
}));

export const adminAuthConfig = registerAs('adminAuth', () => ({
  jwtSecret: process.env.ADMIN_JWT_SECRET,
  jwtExpiresIn: process.env.ADMIN_JWT_EXPIRES_IN ?? '15m',
  jwtAudience: process.env.ADMIN_JWT_AUDIENCE ?? 'cybersave-admin',
  refreshTokenExpiresDays: parseInt(
    process.env.ADMIN_REFRESH_TOKEN_EXPIRES_DAYS ?? '7',
    10,
  ),
}));

export const storageConfig = registerAs('storage', () => ({
  provider: process.env.STORAGE_PROVIDER ?? 'local',
  localPath: process.env.STORAGE_LOCAL_PATH ?? './storage',
  /** Full base URL for presigned storage routes, e.g. http://192.168.1.5:8000/api/v1/storage/local */
  publicBaseUrl: process.env.STORAGE_PUBLIC_BASE_URL,
  uploadUrlTtlSeconds: parseInt(
    process.env.STORAGE_UPLOAD_URL_TTL_SECONDS ?? '900',
    10,
  ),
}));

export const throttlerConfig = registerAs('throttler', () => ({
  ttlMs: parseInt(process.env.THROTTLE_TTL_MS ?? '60000', 10),
  limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
  otpTtlMs: parseInt(process.env.OTP_THROTTLE_TTL_MS ?? '60000', 10),
  otpLimit: parseInt(process.env.OTP_THROTTLE_LIMIT ?? '5', 10),
  loginTtlMs: parseInt(process.env.LOGIN_THROTTLE_TTL_MS ?? '900000', 10),
  loginLimit: parseInt(process.env.LOGIN_THROTTLE_LIMIT ?? '10', 10),
}));

export const paymentConfig = registerAs('payment', () => ({
  provider: process.env.PAYMENT_PROVIDER ?? 'mock',
  skipVerification: process.env.SKIP_PAYMENT_VERIFICATION !== 'false',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
}));

export const bbpsConfig = registerAs('bbps', () => ({
  provider: process.env.BBPS_PROVIDER ?? 'mock',
  convenienceFeeFlat: parseFloat(process.env.BBPS_CONVENIENCE_FEE_FLAT ?? '5'),
  pollIntervalMs: parseInt(process.env.BBPS_POLL_INTERVAL_MS ?? '2000', 10),
  pollMaxAttempts: parseInt(process.env.BBPS_POLL_MAX_ATTEMPTS ?? '30', 10),
}));
