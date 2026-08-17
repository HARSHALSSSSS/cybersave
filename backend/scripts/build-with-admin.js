#!/usr/bin/env node
/**
 * Build admin Vite SPA and copy into backend/admin-dist for same-origin /admin hosting.
 * Requires repo root to include admin/ (set Render root directory to repository root, not backend/).
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const backendRoot = path.join(__dirname, '..');
const repoRoot = path.join(backendRoot, '..');
const adminRoot = path.join(repoRoot, 'admin');
const adminDistSrc = path.join(adminRoot, 'dist');
const adminDistDest = path.join(backendRoot, 'admin-dist');

function run(cwd, command, args, extraEnv = {}) {
  console.log(`[cybersave] (in ${path.basename(cwd)}) ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    env: { ...process.env, ...extraEnv },
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (!fs.existsSync(adminRoot)) {
  console.warn(
    '[cybersave] admin/ folder not found — skipping admin SPA build.',
  );
  console.warn(
    '[cybersave] On Render, set Root Directory to the repository root (not backend/) so admin is available.',
  );
  process.exit(0);
}

const apiBaseUrl =
  process.env.VITE_API_BASE_URL ??
  (process.env.RENDER_EXTERNAL_URL
    ? `${process.env.RENDER_EXTERNAL_URL.replace(/\/$/, '')}/api/v1`
    : 'http://localhost:8000/api/v1');

console.log(`[cybersave] Building admin SPA (VITE_API_BASE_URL=${apiBaseUrl})`);

run(adminRoot, 'npm', ['ci']);
run(adminRoot, 'npm', ['run', 'build'], { VITE_API_BASE_URL: apiBaseUrl });

if (!fs.existsSync(adminDistSrc)) {
  console.error('[cybersave] admin build did not produce admin/dist');
  process.exit(1);
}

fs.rmSync(adminDistDest, { recursive: true, force: true });
fs.cpSync(adminDistSrc, adminDistDest, { recursive: true });
console.log(`[cybersave] Admin SPA ready at backend/admin-dist (${adminDistDest})`);
