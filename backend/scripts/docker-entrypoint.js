#!/usr/bin/env node
/**
 * Docker / Railway boot:
 * 1) sync Prisma schema
 * 2) auto-seed demo data if DB is empty (no manual seed step)
 * 3) start NestJS
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

function countMainServices() {
  const script = `
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    prisma.mainService.count()
      .then(async (n) => {
        console.log(String(n));
        await prisma.$disconnect();
      })
      .catch(async (e) => {
        console.error(e.message || e);
        try { await prisma.$disconnect(); } catch {}
        process.exit(2);
      });
  `;
  const result = spawnSync(process.execPath, ['-e', script], {
    encoding: 'utf8',
    env: process.env,
  });
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || 'count failed').toString());
  }
  return Number((result.stdout || '0').trim()) || 0;
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
  console.log('[cybersave] Syncing database schema (prisma db push)...');
  run('npx', ['prisma', 'db', 'push', '--skip-generate']);
}

const autoSeed =
  process.env.AUTO_SEED !== 'false' && process.env.AUTO_SEED !== '0';

if (autoSeed) {
  try {
    const count = countMainServices();
    if (count === 0) {
      console.log('[cybersave] Empty database — seeding demo data automatically...');
      run('npx', ['ts-node', '--transpile-only', 'prisma/seed.ts']);
      console.log('[cybersave] Seed complete.');
    } else {
      console.log(`[cybersave] Database already has data (${count} categories) — skip seed.`);
    }
  } catch (error) {
    console.error('[cybersave] Auto-seed skipped:', error.message || error);
  }
}

function resolveMainEntry() {
  const candidates = [
    path.join(process.cwd(), 'dist', 'main.js'),
    path.join(process.cwd(), 'dist', 'src', 'main.js'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  console.error('[cybersave] ERROR: Nest build output not found (expected dist/main.js)');
  process.exit(1);
}

console.log('[cybersave] Launching NestJS...');
const child = spawnSync(process.execPath, [resolveMainEntry()], {
  stdio: 'inherit',
  env: process.env,
});
process.exit(child.status ?? 1);
