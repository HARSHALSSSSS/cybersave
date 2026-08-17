import { PrismaClient } from '@prisma/client';

import { DEFAULT_GOVERNMENT_SCHEMES } from '../src/modules/government-schemes/data/default-schemes';

export async function seedGovernmentSchemes(prisma: PrismaClient) {
  console.log('Seeding government schemes...');
  for (const scheme of DEFAULT_GOVERNMENT_SCHEMES) {
    await prisma.governmentScheme.upsert({
      where: { slug: scheme.slug },
      update: {
        name: scheme.name,
        ministry: scheme.ministry,
        category: scheme.category,
        description: scheme.description,
        whoCanApply: scheme.whoCanApply,
        eligibility: scheme.eligibility,
        documentsRequired: scheme.documentsRequired,
        officialPortalUrl: scheme.officialPortalUrl,
        displayOrder: scheme.displayOrder,
        isActive: true,
      },
      create: scheme,
    });
  }
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await seedGovernmentSchemes(prisma);
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
