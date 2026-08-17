import { existsSync } from 'fs';
import { join } from 'path';

import type { NestExpressApplication } from '@nestjs/platform-express';
import express, { type NextFunction, type Request, type Response } from 'express';

/**
 * Serve the admin Vite build at /admin with correct asset MIME types and SPA fallback.
 * Built assets live in backend/admin-dist (see scripts/build-with-admin.js).
 */
export function mountAdminSpa(app: NestExpressApplication): void {
  const adminDist = join(__dirname, '..', '..', 'admin-dist');

  if (!existsSync(adminDist)) {
    console.warn(
      '[cybersave] admin-dist/ missing — /admin UI will not be served. Run scripts/build-with-admin.js on deploy.',
    );
    return;
  }

  const indexHtml = join(adminDist, 'index.html');

  app.use('/admin', (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    next();
  });

  app.use(
    '/admin',
    express.static(adminDist, {
      index: false,
      fallthrough: true,
      maxAge: '1y',
      setHeaders(res, filePath) {
        if (filePath.endsWith('.css')) {
          res.setHeader('Content-Type', 'text/css; charset=utf-8');
        } else if (filePath.endsWith('.js') || filePath.endsWith('.mjs')) {
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        } else if (filePath.endsWith('.svg')) {
          res.setHeader('Content-Type', 'image/svg+xml');
        } else if (filePath.endsWith('.html')) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache');
        }
      },
    }),
  );

  const http = app.getHttpAdapter().getInstance();

  http.get('/admin', (_req: Request, res: Response) => {
    res.redirect(301, '/admin/');
  });

  http.get('/admin/', (_req: Request, res: Response) => {
    res.sendFile(indexHtml);
  });

  http.get(/^\/admin(\/.*)?$/, (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      next();
      return;
    }
    const subPath = req.path.replace(/^\/admin\/?/, '');
    if (subPath.includes('.') && subPath !== '') {
      next();
      return;
    }
    res.sendFile(indexHtml);
  });

  console.log(`[cybersave] Admin SPA mounted at /admin/ (${adminDist})`);
}
