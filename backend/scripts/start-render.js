#!/usr/bin/env node
/**
 * Render / production boot (Node runtime):
 * 1) sync Prisma schema
 * 2) start compiled NestJS (never nest start — that OOMs on 512MB)
 * 3) optional ts-node seed only when RUN_BOOT_SEED=true
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  require('dotenv').config({ path: path.join(process.cwd(), '.env') });
} catch {
  // dotenv is optional; Render injects env vars.
}

const { ensureProductionEnv } = require('./ensure-env');

if (!process.env.NODE_OPTIONS) {
  process.env.NODE_OPTIONS = '--max-old-space-size=384';
}

function run(command, args, { fatal = true } = {}) {
  console.log(`[cybersave] ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    env: process.env,
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    if (fatal) {
      process.exit(result.status ?? 1);
    }
    return false;
  }
  return true;
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

function countGovernmentSchemes() {
  const script = `
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    prisma.governmentScheme.count()
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

function maybeSeed() {
  const autoSeed =
    process.env.AUTO_SEED !== 'false' && process.env.AUTO_SEED !== '0';
  if (!autoSeed) {
    return;
  }

  const onRender = Boolean(process.env.RENDER);
  const forceSeed = process.env.RUN_BOOT_SEED === 'true' || process.env.RUN_BOOT_SEED === '1';
  // ts-node + Nest on a 512MB free instance typically OOMs. Skip unless forced.
  if (onRender && !forceSeed) {
    console.log(
      '[cybersave] Skipping catalog seed/sync at boot (avoids heap OOM). API will start now.',
    );
    console.log(
      '[cybersave] After the service is live, set RUN_BOOT_SEED=true and redeploy once to load services.',
    );
    return;
  }

  try {
    const count = countMainServices();
    if (count === 0) {
      console.log('[cybersave] Empty database — seeding demo data automatically...');
      run('npx', ['ts-node', '--transpile-only', 'prisma/seed.ts'], { fatal: false });
      console.log('[cybersave] Seed step finished.');
    } else {
      console.log(
        `[cybersave] Database already has data (${count} categories) — syncing services catalog...`,
      );
      if (
        run('npx', ['ts-node', '--transpile-only', 'prisma/sync-services-catalog.ts'], {
          fatal: false,
        })
      ) {
        console.log('[cybersave] Services catalog sync complete.');
      } else {
        console.error('[cybersave] Catalog sync failed — continuing API startup.');
      }
      try {
        const schemeCount = countGovernmentSchemes();
        if (schemeCount === 0) {
          console.log('[cybersave] No government schemes — seeding schemes...');
          run('npx', ['ts-node', '--transpile-only', 'prisma/seed-schemes.ts'], {
            fatal: false,
          });
          console.log('[cybersave] Scheme seed complete.');
        } else {
          console.log(`[cybersave] Government schemes already present (${schemeCount}).`);
        }
      } catch (schemeError) {
        console.error('[cybersave] Scheme seed skipped:', schemeError.message || schemeError);
      }
    }
  } catch (error) {
    console.error('[cybersave] Auto-seed skipped:', error.message || error);
  }
}

console.log('[cybersave] Starting API...');
console.log(`[cybersave] NODE_ENV=${process.env.NODE_ENV} PORT=${process.env.PORT}`);

if (!process.env.DATABASE_URL) {
  console.error('[cybersave] ERROR: DATABASE_URL is not set');
  console.error('[cybersave] Create a free Neon DB (neon.tech) and paste DATABASE_URL in Render Environment.');
  process.exit(1);
}

ensureProductionEnv();

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

maybeSeed();

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
  console.error('[cybersave] Build Command must run: npm run build');
  console.error('[cybersave] Do not use "npm start" / "nest start" on Render.');
  process.exit(1);
}

console.log('[cybersave] Launching NestJS...');
const child = spawnSync(process.execPath, [resolveMainEntry()], {
  stdio: 'inherit',
  env: process.env,
});
process.exit(child.status ?? 1);
