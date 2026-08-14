import {
  Prisma,
  PrismaClient,
  ServiceVersionLifecycleStatus,
} from '@prisma/client';

import {
  DEFAULT_WORKFLOW_STEPS,
  DEFAULT_WORKFLOW_TRANSITIONS,
} from '../src/modules/service-versions/constants/default-workflow.template';
import {
  GOVERNMENT_SERVICES_CATALOG,
  type SubServiceSeed,
} from './seed-services-catalog';
import { buildServiceTranslations } from './seed-service-translations';

async function createWorkflow(prisma: PrismaClient, serviceVersionId: string) {
  const workflow = await prisma.workflowDefinition.create({
    data: { serviceVersionId },
  });
  const stepIdByKey = new Map<string, string>();
  for (const step of DEFAULT_WORKFLOW_STEPS) {
    const created = await prisma.workflowStep.create({
      data: {
        workflowDefinitionId: workflow.id,
        stepKey: step.stepKey,
        name: step.name,
        applicationStatus: step.applicationStatus,
        sortOrder: step.sortOrder,
        isInitial: step.isInitial ?? false,
        isTerminal: step.isTerminal ?? false,
        citizenVisible: step.citizenVisible ?? true,
      },
    });
    stepIdByKey.set(step.stepKey, created.id);
  }
  for (const transition of DEFAULT_WORKFLOW_TRANSITIONS) {
    const fromStepId = stepIdByKey.get(transition.fromStepKey);
    const toStepId = stepIdByKey.get(transition.toStepKey);
    if (!fromStepId || !toStepId) continue;
    await prisma.workflowTransition.create({
      data: {
        workflowDefinitionId: workflow.id,
        fromStepId,
        toStepId,
        actionKey: transition.actionKey,
        label: transition.label,
        allowedRoleIds: [],
        requiredPermissions: transition.requiredPermissions ?? [],
        requiresComment: transition.requiresComment ?? false,
        createsActionRequest: transition.createsActionRequest ?? false,
        notifyCitizen: transition.notifyCitizen ?? false,
      },
    });
  }
}

async function syncPublishedMetadata(
  prisma: PrismaClient,
  versionId: string,
  seed: SubServiceSeed,
) {
  await prisma.serviceOverview.updateMany({
    where: { serviceVersionId: versionId },
    data: {
      displayName: seed.displayName,
      shortDescription: seed.shortDescription,
      richDescription: seed.richDescription,
      instructions: seed.instructions,
      processingTime: seed.processingTime,
      department: seed.department,
      seoTags: [seed.slug, seed.name],
      translations: buildServiceTranslations(seed),
    },
  });

  const fulfillment = await prisma.serviceFulfillmentConfig.findFirst({
    where: { serviceVersionId: versionId },
  });
  if (fulfillment) {
    await prisma.serviceFulfillmentConfig.update({
      where: { id: fulfillment.id },
      data: {
        requiresStateSelection: seed.requiresState,
        defaultPlatformFee: new Prisma.Decimal(seed.defaultPlatformFee ?? 49),
        defaultPortalUrl: seed.defaultPortalUrl,
        manualInstructions: seed.manualInstructions,
      },
    });

    await prisma.serviceStateVariant.deleteMany({
      where: { fulfillmentConfigId: fulfillment.id },
    });

    if (seed.requiresState && seed.statePortals?.length) {
      await prisma.serviceStateVariant.createMany({
        data: seed.statePortals.map((s, index) => ({
          fulfillmentConfigId: fulfillment.id,
          stateCode: s.code,
          stateName: s.name,
          officialPortalUrl: s.portalUrl,
          platformFee: new Prisma.Decimal(s.platformFee ?? 49),
          baseFeeOverride: s.baseFeeOverride
            ? new Prisma.Decimal(s.baseFeeOverride)
            : null,
          processingTime: s.processingTime,
          department: s.department,
          sortOrder: index,
        })),
      });
    }
  }

  const formVersion = await prisma.formVersion.findFirst({
    where: { serviceVersionId: versionId },
    orderBy: { versionNumber: 'desc' },
  });
  if (formVersion) {
    await prisma.formField.deleteMany({ where: { formVersionId: formVersion.id } });
    for (const [index, field] of seed.formFields.entries()) {
      await prisma.formField.create({
        data: {
          formVersionId: formVersion.id,
          key: field.key,
          label: field.label,
          type: field.type,
          sortOrder: index,
          required: field.required ?? false,
          placeholder: field.placeholder,
        },
      });
    }
  }

  const existingDocs = await prisma.documentRequirement.findMany({
    where: { serviceVersionId: versionId },
  });
  for (const [index, docName] of seed.documents.entries()) {
    const existing = existingDocs.find(d => d.name === docName);
    if (existing) {
      await prisma.documentRequirement.update({
        where: { id: existing.id },
        data: {
          required: true,
          sortOrder: index,
          allowedFormats: ['pdf', 'jpg', 'png'],
          allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
          maxFileSizeBytes: 5_242_880,
        },
      });
    } else {
      await prisma.documentRequirement.create({
        data: {
          serviceVersionId: versionId,
          name: docName,
          required: true,
          allowedFormats: ['pdf', 'jpg', 'png'],
          allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
          maxFileSizeBytes: 5_242_880,
          sortOrder: index,
        },
      });
    }
  }

  const pricing = await prisma.pricingConfig.findFirst({
    where: { serviceVersionId: versionId },
  });
  if (pricing) {
    await prisma.pricingConfig.update({
      where: { id: pricing.id },
      data: { baseFee: new Prisma.Decimal(seed.baseFee) },
    });
    await prisma.additionalCharge.deleteMany({ where: { pricingConfigId: pricing.id } });
    if (seed.serviceFee && seed.serviceFee > 0) {
      await prisma.additionalCharge.create({
        data: {
          pricingConfigId: pricing.id,
          name: 'Cybersave Service Fee',
          amount: new Prisma.Decimal(seed.serviceFee),
        },
      });
    }
  }

  const workflow = await prisma.workflowDefinition.findFirst({
    where: { serviceVersionId: versionId },
  });
  if (!workflow) {
    await createWorkflow(prisma, versionId);
  }
}

async function publishSubService(
  prisma: PrismaClient,
  mainId: string,
  seed: SubServiceSeed,
  sortOrder: number,
) {
  const sub = await prisma.subService.upsert({
    where: { mainServiceId_slug: { mainServiceId: mainId, slug: seed.slug } },
    update: { name: seed.name, description: seed.description, sortOrder, status: 'ACTIVE' },
    create: {
      mainServiceId: mainId,
      name: seed.name,
      slug: seed.slug,
      description: seed.description,
      sortOrder,
      status: 'ACTIVE',
    },
  });

  const existingPublished = await prisma.serviceVersion.findFirst({
    where: { subServiceId: sub.id, lifecycleStatus: 'PUBLISHED' },
  });
  if (existingPublished) {
    await syncPublishedMetadata(prisma, existingPublished.id, seed);
    console.log(`  sync (published): ${seed.displayName}`);
    return;
  }

  await prisma.serviceVersion.updateMany({
    where: { subServiceId: sub.id, lifecycleStatus: 'DRAFT' },
    data: { lifecycleStatus: 'ARCHIVED' },
  });

  const version = await prisma.serviceVersion.create({
    data: {
      subServiceId: sub.id,
      versionNumber: 1,
      lifecycleStatus: ServiceVersionLifecycleStatus.PUBLISHED,
      publishedAt: new Date(),
    },
  });

  await prisma.serviceOverview.create({
    data: {
      serviceVersionId: version.id,
      displayName: seed.displayName,
      shortDescription: seed.shortDescription,
      richDescription: seed.richDescription,
      instructions: seed.instructions,
      processingTime: seed.processingTime,
      department: seed.department,
      seoTags: [seed.slug, seed.name],
      translations: buildServiceTranslations(seed),
    },
  });

  const formVersion = await prisma.formVersion.create({
    data: { serviceVersionId: version.id, versionNumber: 1, status: 'PUBLISHED' },
  });

  for (const [index, field] of seed.formFields.entries()) {
    await prisma.formField.create({
      data: {
        formVersionId: formVersion.id,
        key: field.key,
        label: field.label,
        type: field.type,
        sortOrder: index,
        required: field.required ?? false,
        placeholder: field.placeholder,
      },
    });
  }

  for (const [index, docName] of seed.documents.entries()) {
    await prisma.documentRequirement.create({
      data: {
        serviceVersionId: version.id,
        name: docName,
        required: true,
        allowedFormats: ['pdf', 'jpg', 'png'],
        allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        maxFileSizeBytes: 5_242_880,
        sortOrder: index,
      },
    });
  }

  const pricing = await prisma.pricingConfig.create({
    data: {
      serviceVersionId: version.id,
      baseFee: new Prisma.Decimal(seed.baseFee),
      taxEnabled: false,
      taxRate: new Prisma.Decimal(0),
      currency: 'INR',
    },
  });

  if (seed.serviceFee && seed.serviceFee > 0) {
    await prisma.additionalCharge.create({
      data: {
        pricingConfigId: pricing.id,
        name: 'Cybersave Service Fee',
        amount: new Prisma.Decimal(seed.serviceFee),
      },
    });
  }

  const fulfillment = await prisma.serviceFulfillmentConfig.create({
    data: {
      serviceVersionId: version.id,
      assistedEnabled: true,
      manualEnabled: true,
      requiresStateSelection: seed.requiresState,
      defaultPlatformFee: new Prisma.Decimal(seed.defaultPlatformFee ?? 49),
      defaultPortalUrl: seed.defaultPortalUrl,
      manualInstructions: seed.manualInstructions,
    },
  });

  if (seed.requiresState && seed.statePortals?.length) {
    await prisma.serviceStateVariant.createMany({
      data: seed.statePortals.map((s, index) => ({
        fulfillmentConfigId: fulfillment.id,
        stateCode: s.code,
        stateName: s.name,
        officialPortalUrl: s.portalUrl,
        platformFee: new Prisma.Decimal(s.platformFee ?? 49),
        baseFeeOverride: s.baseFeeOverride
          ? new Prisma.Decimal(s.baseFeeOverride)
          : null,
        processingTime: s.processingTime,
        department: s.department,
        sortOrder: index,
      })),
    });
  }

  await createWorkflow(prisma, version.id);
  console.log(`  published: ${seed.displayName}`);
}

export async function seedGovernmentServices(prisma: PrismaClient) {
  console.log('Seeding government services catalog...');
  console.log(
    `Catalog: ${GOVERNMENT_SERVICES_CATALOG.length} categories, ${GOVERNMENT_SERVICES_CATALOG.reduce((n, m) => n + m.subServices.length, 0)} services`,
  );

  const officialMainSlugs = new Set(GOVERNMENT_SERVICES_CATALOG.map(m => m.slug));

  const hiddenMain = await prisma.mainService.updateMany({
    where: {
      OR: [
        { slug: { startsWith: 'e2e-main-' } },
        { slug: { startsWith: 'section-main-' } },
        {
          slug: { notIn: [...officialMainSlugs] },
          OR: [
            { name: { contains: 'E2E' } },
            { name: { contains: 'Section Main' } },
          ],
        },
      ],
    },
    data: { isVisible: false, status: 'ARCHIVED' },
  });

  const hiddenSub = await prisma.subService.updateMany({
    where: {
      OR: [
        { slug: { startsWith: 'e2e-sub-' } },
        { slug: { startsWith: 'section-sub-' } },
        { name: { contains: 'E2E Sub' } },
        { name: { contains: 'Section Sub' } },
      ],
    },
    data: { status: 'ARCHIVED' },
  });

  if (hiddenMain.count > 0 || hiddenSub.count > 0) {
    console.log(
      `Hidden test services: ${hiddenMain.count} categories, ${hiddenSub.count} sub-services`,
    );
  }

  for (const main of GOVERNMENT_SERVICES_CATALOG) {
    const mainService = await prisma.mainService.upsert({
      where: { slug: main.slug },
      update: {
        name: main.name,
        description: main.description,
        sortOrder: main.sortOrder,
        status: 'ACTIVE',
        isVisible: true,
      },
      create: {
        name: main.name,
        slug: main.slug,
        description: main.description,
        sortOrder: main.sortOrder,
        status: 'ACTIVE',
        isVisible: true,
      },
    });

    console.log(`Main: ${main.name}`);
    for (const [index, sub] of main.subServices.entries()) {
      await publishSubService(prisma, mainService.id, sub, index + 1);
    }
  }

  console.log('Government services seed complete.');
  console.log('Manage & publish new services from Admin → Services wizard.');
}
