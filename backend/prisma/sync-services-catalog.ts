import { PrismaClient } from '@prisma/client';

import { seedGovernmentServices } from './seed-services';

/** Idempotent sync: updates published services + state portals (BR, MH, etc.). */
export async function syncServicesCatalog(prisma: PrismaClient) {
  await seedGovernmentServices(prisma);
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await syncServicesCatalog(prisma);
    console.log('Services catalog sync complete.');
  } finally {
    await prisma.$disconnect();
  }
}

const isDirectRun =
  typeof require !== 'undefined' && require.main === module;

if (isDirectRun) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
