/** Centralized, typed access to build-time environment variables. */

function routerBasename(raw?: string): string {
  const value = (raw ?? '/').trim() || '/';
  if (value === '/') return '/';
  return `/${value.replace(/^\/+|\/+$/g, '')}`;
}

function loginPath(basename: string): string {
  return basename === '/' ? '/login' : `${basename}/login`;
}

const basename = routerBasename(import.meta.env.VITE_ADMIN_BASE);

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1',
  appName: import.meta.env.VITE_APP_NAME ?? 'Cybersave Admin',
  appEnv: import.meta.env.VITE_APP_ENV ?? 'development',
  routerBasename: basename,
  loginPath: loginPath(basename),
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;

export type Env = typeof env;
