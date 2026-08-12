import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ServiceVersionLifecycleStatus } from '@prisma/client';

import { PrismaService } from '@/database/database.module';
import {
  DEFAULT_WORKFLOW_STEPS,
  DEFAULT_WORKFLOW_TRANSITIONS,
} from '../constants/default-workflow.template';

@Injectable()
export class ServiceVersionsBundleService {
  constructor(private readonly prisma: PrismaService) {}

  async createDraftVersion(subServiceId: string, displayName: string) {
    const latest = await this.prisma.serviceVersion.findFirst({
      where: { subServiceId },
      orderBy: { versionNumber: 'desc' },
    });

    const versionNumber = (latest?.versionNumber ?? 0) + 1;

    const serviceVersion = await this.prisma.serviceVersion.create({
      data: {
        subServiceId,
        versionNumber,
        lifecycleStatus: ServiceVersionLifecycleStatus.DRAFT,
      },
    });

    await this.createEmptyBundle(serviceVersion.id, displayName);

    return this.getFullBundle(serviceVersion.id);
  }

  async cloneDraftVersion(subServiceId: string, sourceVersionId?: string) {
    const existingDraft = await this.prisma.serviceVersion.findFirst({
      where: {
        subServiceId,
        lifecycleStatus: ServiceVersionLifecycleStatus.DRAFT,
      },
    });

    if (existingDraft) {
      throw new BadRequestException(
        'A draft version already exists. Edit or publish it before creating another.',
      );
    }

    const source = sourceVersionId
      ? await this.prisma.serviceVersion.findFirst({
          where: { id: sourceVersionId, subServiceId },
        })
      : await this.prisma.serviceVersion.findFirst({
          where: { subServiceId },
          orderBy: { versionNumber: 'desc' },
        });

    if (!source) {
      throw new NotFoundException('Source service version not found');
    }

    const latest = await this.prisma.serviceVersion.findFirst({
      where: { subServiceId },
      orderBy: { versionNumber: 'desc' },
    });

    const versionNumber = (latest?.versionNumber ?? 0) + 1;

    const newVersion = await this.prisma.serviceVersion.create({
      data: {
        subServiceId,
        versionNumber,
        lifecycleStatus: ServiceVersionLifecycleStatus.DRAFT,
      },
    });

    const sourceBundle = await this.getFullBundle(source.id);
    const displayName =
      sourceBundle.overview?.displayName ?? 'Untitled Service';

    await this.createEmptyBundle(newVersion.id, displayName);

    if (sourceBundle.overview) {
      await this.prisma.serviceOverview.update({
        where: { serviceVersionId: newVersion.id },
        data: {
          displayName: sourceBundle.overview.displayName,
          shortDescription: sourceBundle.overview.shortDescription,
          richDescription: sourceBundle.overview.richDescription,
          instructions: sourceBundle.overview.instructions,
          termsAndConditions: sourceBundle.overview.termsAndConditions,
          processingTime: sourceBundle.overview.processingTime,
          department: sourceBundle.overview.department,
          seoTags: sourceBundle.overview.seoTags,
        },
      });
    }

    const targetForm = await this.prisma.formVersion.findUnique({
      where: { serviceVersionId: newVersion.id },
    });

    if (targetForm && sourceBundle.formVersion?.fields?.length) {
      for (const field of sourceBundle.formVersion.fields) {
        await this.prisma.formField.create({
          data: {
            formVersionId: targetForm.id,
            key: field.key,
            label: field.label,
            type: field.type,
            sortOrder: field.sortOrder,
            required: field.required,
            visible: field.visible,
            placeholder: field.placeholder,
            helpText: field.helpText,
            defaultValue: field.defaultValue,
            config: field.config as Prisma.InputJsonValue,
            validation: field.validation as Prisma.InputJsonValue,
            options: field.options?.length
              ? {
                  create: field.options.map((opt) => ({
                    label: opt.label,
                    value: opt.value,
                    sortOrder: opt.sortOrder,
                  })),
                }
              : undefined,
          },
        });
      }
    }

    if (sourceBundle.documentRequirements?.length) {
      await this.prisma.documentRequirement.createMany({
        data: sourceBundle.documentRequirements.map((doc) => ({
          serviceVersionId: newVersion.id,
          name: doc.name,
          description: doc.description,
          required: doc.required,
          allowedFormats: doc.allowedFormats,
          allowedMimeTypes: doc.allowedMimeTypes,
          maxFileSizeBytes: doc.maxFileSizeBytes,
          maxFiles: doc.maxFiles,
          instructions: doc.instructions,
          sortOrder: doc.sortOrder,
          config: doc.config as Prisma.InputJsonValue,
        })),
      });
    }

    if (sourceBundle.pricingConfig) {
      const pricing = await this.prisma.pricingConfig.update({
        where: { serviceVersionId: newVersion.id },
        data: {
          baseFee: sourceBundle.pricingConfig.baseFee,
          taxEnabled: sourceBundle.pricingConfig.taxEnabled,
          taxRate: sourceBundle.pricingConfig.taxRate,
          currency: sourceBundle.pricingConfig.currency,
        },
      });

      if (sourceBundle.pricingConfig.additionalCharges?.length) {
        await this.prisma.additionalCharge.createMany({
          data: sourceBundle.pricingConfig.additionalCharges.map((charge) => ({
            pricingConfigId: pricing.id,
            name: charge.name,
            amount: charge.amount,
            condition: charge.condition,
          })),
        });
      }
    }

    if (sourceBundle.workflowDefinition) {
      const targetWorkflow = await this.prisma.workflowDefinition.findUnique({
        where: { serviceVersionId: newVersion.id },
      });

      if (targetWorkflow) {
        await this.prisma.workflowTransition.deleteMany({
          where: { workflowDefinitionId: targetWorkflow.id },
        });
        await this.prisma.workflowStep.deleteMany({
          where: { workflowDefinitionId: targetWorkflow.id },
        });

        const stepIdByKey = new Map<string, string>();
        for (const step of sourceBundle.workflowDefinition.steps) {
          const created = await this.prisma.workflowStep.create({
            data: {
              workflowDefinitionId: targetWorkflow.id,
              stepKey: step.stepKey,
              name: step.name,
              description: step.description,
              sortOrder: step.sortOrder,
              applicationStatus: step.applicationStatus,
              isInitial: step.isInitial,
              isTerminal: step.isTerminal,
              citizenVisible: step.citizenVisible,
              slaHours: step.slaHours,
            },
          });
          stepIdByKey.set(step.stepKey, created.id);
        }

        const sourceStepKeyById = new Map(
          sourceBundle.workflowDefinition.steps.map((s) => [s.id, s.stepKey]),
        );

        for (const transition of sourceBundle.workflowDefinition.transitions) {
          const fromKey = sourceStepKeyById.get(transition.fromStepId);
          const toKey = sourceStepKeyById.get(transition.toStepId);
          const fromStepId = fromKey ? stepIdByKey.get(fromKey) : undefined;
          const toStepId = toKey ? stepIdByKey.get(toKey) : undefined;
          if (!fromStepId || !toStepId) continue;

          await this.prisma.workflowTransition.create({
            data: {
              workflowDefinitionId: targetWorkflow.id,
              fromStepId,
              toStepId,
              actionKey: transition.actionKey,
              label: transition.label,
              allowedRoleIds: transition.allowedRoleIds,
              requiredPermissions: transition.requiredPermissions,
              requiresComment: transition.requiresComment,
              requiresAssignment: transition.requiresAssignment,
              createsActionRequest: transition.createsActionRequest,
              notifyCitizen: transition.notifyCitizen,
              guardConfig: transition.guardConfig as Prisma.InputJsonValue,
            },
          });
        }
      }
    }

    return this.getFullBundle(newVersion.id);
  }

  async getFullBundle(serviceVersionId: string) {
    const version = await this.prisma.serviceVersion.findUnique({
      where: { id: serviceVersionId },
      include: {
        subService: { include: { mainService: true } },
        overview: true,
        formVersion: {
          include: {
            fields: {
              include: { options: true },
              orderBy: { sortOrder: 'asc' },
            },
            conditions: true,
          },
        },
        documentRequirements: { orderBy: { sortOrder: 'asc' } },
        pricingConfig: { include: { additionalCharges: true } },
        fulfillmentConfig: {
          include: { stateVariants: { orderBy: { sortOrder: 'asc' } } },
        },
        workflowDefinition: {
          include: {
            steps: { orderBy: { sortOrder: 'asc' } },
            transitions: true,
          },
        },
      },
    });

    if (!version) {
      throw new NotFoundException('Service version not found');
    }

    return version;
  }

  async ensureDraft(serviceVersionId: string) {
    const version = await this.prisma.serviceVersion.findUnique({
      where: { id: serviceVersionId },
    });

    if (!version) {
      throw new NotFoundException('Service version not found');
    }

    if (version.lifecycleStatus !== ServiceVersionLifecycleStatus.DRAFT) {
      throw new BadRequestException(
        'Only draft service versions can be modified',
      );
    }

    return version;
  }

  private async createEmptyBundle(serviceVersionId: string, displayName: string) {
    await this.prisma.serviceOverview.create({
      data: {
        serviceVersionId,
        displayName,
        seoTags: [],
      },
    });

    await this.prisma.formVersion.create({
      data: { serviceVersionId, versionNumber: 1, status: 'DRAFT' },
    });

    await this.prisma.pricingConfig.create({
      data: {
        serviceVersionId,
        baseFee: new Prisma.Decimal(0),
        taxEnabled: false,
        taxRate: new Prisma.Decimal(0),
        currency: 'INR',
      },
    });

    await this.prisma.serviceFulfillmentConfig.create({
      data: {
        serviceVersionId,
        assistedEnabled: true,
        manualEnabled: false,
        defaultPlatformFee: new Prisma.Decimal(49),
      },
    });

    const workflow = await this.prisma.workflowDefinition.create({
      data: { serviceVersionId },
    });

    const stepIdByKey = new Map<string, string>();

    for (const step of DEFAULT_WORKFLOW_STEPS) {
      const created = await this.prisma.workflowStep.create({
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

      await this.prisma.workflowTransition.create({
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
}
