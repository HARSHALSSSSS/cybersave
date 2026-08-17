import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// `/admin/` when served by the API at https://your-api.onrender.com/admin/
// `/` when deployed as a Render Static Site at its own URL (cybersave-admin.onrender.com)
const adminBase = process.env.VITE_ADMIN_BASE ?? '/';

export default defineConfig({
  base: adminBase.endsWith('/') ? adminBase : `${adminBase}/`,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
  server: {
    port: 5173,
  },
});
