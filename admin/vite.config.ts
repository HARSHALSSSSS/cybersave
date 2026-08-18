import path from 'node:path';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// `/admin/` when served by the API at https://your-api.onrender.com/admin/
// `/` when deployed as a Render Static Site at its own URL (cybersave-admin.onrender.com)
const adminBase = process.env.VITE_ADMIN_BASE ?? '/';

function spaFallbackFiles(basePath: string): Plugin {
  const normalized = basePath.replace(/^\/+|\/+$/g, '');
  const rewriteBase = normalized ? `/${normalized}/` : '/';
  const indexHtml = normalized ? `/${normalized}/index.html` : '/index.html';
  const redirectsRule = normalized
    ? `/${normalized}/*  /${normalized}/index.html  200`
    : '/*  /index.html  200';

  return {
    name: 'spa-fallback-files',
    closeBundle() {
      const outDir = path.join(rootDir, 'dist');
      writeFileSync(
        path.join(outDir, '.htaccess'),
        `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase ${rewriteBase}
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . ${indexHtml} [L]
</IfModule>
`,
      );
      writeFileSync(path.join(outDir, '_redirects'), `${redirectsRule}\n`);
    },
  };
}

export default defineConfig({
  base: adminBase.endsWith('/') ? adminBase : `${adminBase}/`,
  plugins: [react(), tailwindcss(), spaFallbackFiles(adminBase)],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
  server: {
    port: 5173,
  },
});
