#!/usr/bin/env node
/**
 * Docker / Railway boot: sync Prisma schema, then start NestJS.
 * Uses Node so Windows CRLF in the repo cannot break the container.
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(command, args) {
  console.log(`[cybersave] ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    env: process.env,
    shell: false,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log('[cybersave] Starting API...');
console.log(`[cybersave] NODE_ENV=${process.env.NODE_ENV} PORT=${process.env.PORT}`);

if (!process.env.DATABASE_URL) {
  console.error('[cybersave] ERROR: DATABASE_URL is not set');
  process.exit(1);
}

const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations');
const hasMigrations =
  fs.existsSync(migrationsDir) &&
  fs.readdirSync(migrationsDir).some((name) => !name.startsWith('.'));

if (hasMigrations) {
  run('npx', ['prisma', 'migrate', 'deploy']);
} else {
  console.log('[cybersave] No migrations folder — running prisma db push...');
  run('npx', ['prisma', 'db', 'push', '--skip-generate']);
}

console.log('[cybersave] Launching NestJS...');
const node = process.execPath;
const main = path.join(process.cwd(), 'dist', 'main.js');
const child = spawnSync(node, [main], {
  stdio: 'inherit',
  env: process.env,
});
process.exit(child.status ?? 1);
