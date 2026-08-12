import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationStatus, Prisma, ServiceVersionLifecycleStatus } from '@prisma/client';

import { PrismaService } from '@/database/database.module';
import { AuditLogService } from '@/modules/audit-logs/audit-log.service';
import {
  fieldKeyFromLabel,
  resolveFormFieldType,
} from '../constants/field-type.map';
import { SaveFormDto } from '../dto/save-form.dto';
import { SaveDocumentRequirementsDto } from '../dto/save-document-requirements.dto';
import { SaveFulfillmentDto } from '../dto/save-fulfillment.dto';
import { SavePricingDto } from '../dto/save-pricing.dto';
import { SaveWorkflowDto } from '../dto/save-workflow.dto';
import { ServiceVersionsBundleService } from './service-versions-bundle.service';

@Injectable()
export class ServiceVersionsWizardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bundleService: ServiceVersionsBundleService,
  ) {}

  async saveForm(serviceVersionId: string, dto: SaveFormDto) {
    await this.bundleService.ensureDraft(serviceVersionId);

    const formVersion = await this.prisma.formVersion.findUnique({
      where: { serviceVersionId },
    });

    if (!formVersion) {
      throw new NotFoundException('Form version not found');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.formFieldOption.deleteMany({
        where: { formField: { formVersionId: formVersion.id } },
      });
      await tx.formCondition.deleteMany({
        where: { formVersionId: formVersion.id },
      });
      await tx.formField.deleteMany({
        where: { formVersionId: formVersion.id },
      });

      for (const [index, field] of dto.fields.entries()) {
        const key = field.key ?? fieldKeyFromLabel(field.label, index);
        const created = await tx.formField.create({
          data: {
            formVersionId: formVersion.id,
            key,
            label: field.label,
            type: resolveFormFieldType(field.type),
            sortOrder: field.sortOrder ?? index,
            required: field.required ?? false,
            visible: field.visible ?? true,
            placeholder: field.placeholder,
            helpText: field.helpText,
            defaultValue: field.defaultValue,
            config: (field.config ?? {}) as Prisma.InputJsonValue,
            validation: (field.validation ?? {}) as Prisma.InputJsonValue,
          },
        });

        if (field.options?.length) {
          await tx.formFieldOption.createMany({
            data: field.options.map((opt, optIndex) => ({
              formFieldId: created.id,
              label: opt.label,
              value: opt.value,
              sortOrder: opt.sortOrder ?? optIndex,
            })),
          });
        }
      }

      if (dto.conditions?.length) {
        await tx.formCondition.createMany({
          data: dto.conditions.map((c) => ({
            formVersionId: formVersion.id,
            sourceFieldKey: c.sourceFieldKey,
            operator: c.operator,
            value: c.value,
            action: c.action,
            targetFieldKeys: c.targetFieldKeys,
            rule: (c.rule ?? {}) as Prisma.InputJsonValue,
          })),
        });
      }
    });

    return this.bundleService.getFullBundle(serviceVersionId);
  }

  async saveDocuments(serviceVersionId: string, dto: SaveDocumentRequirementsDto) {
    await this.bundleService.ensureDraft(serviceVersionId);

    await this.prisma.$transaction(async (tx) => {
      await tx.documentRequirement.deleteMany({ where: { serviceVersionId } });

      if (dto.requirements.length) {
        await tx.documentRequirement.createMany({
          data: dto.requirements.map((req, index) => ({
            serviceVersionId,
            name: req.name,
            description: req.description,
            required: req.required ?? true,
            allowedFormats: req.allowedFormats ?? ['pdf', 'jpg', 'png'],
            allowedMimeTypes:
              req.allowedMimeTypes ?? [
                'application/pdf',
                'image/jpeg',
                'image/png',
              ],
            maxFileSizeBytes: req.maxFileSizeBytes ?? 5_242_880,
            maxFiles: req.maxFiles ?? 1,
            instructions: req.instructions,
            sortOrder: req.sortOrder ?? index,
            config: (req.config ?? {}) as Prisma.InputJsonValue,
          })),
        });
      }
    });

    return this.bundleService.getFullBundle(serviceVersionId);
  }

  async savePricing(serviceVersionId: string, dto: SavePricingDto) {
    await this.bundleService.ensureDraft(serviceVersionId);

    const pricing = await this.prisma.pricingConfig.findUnique({
      where: { serviceVersionId },
    });

    if (!pricing) {
      throw new NotFoundException('Pricing config not found');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.additionalCharge.deleteMany({
        where: { pricingConfigId: pricing.id },
      });

      await tx.pricingConfig.update({
        where: { id: pricing.id },
        data: {
          baseFee: new Prisma.Decimal(dto.baseFee),
          taxEnabled: dto.taxEnabled ?? false,
          taxRate: new Prisma.Decimal(dto.taxRate ?? 0),
          currency: dto.currency ?? 'INR',
        },
      });

      if (dto.additionalCharges?.length) {
        await tx.additionalCharge.createMany({
          data: dto.additionalCharges.map((charge) => ({
            pricingConfigId: pricing.id,
            name: charge.name,
            amount: new Prisma.Decimal(charge.amount),
            condition: charge.condition,
          })),
        });
      }
    });

    return this.bundleService.getFullBundle(serviceVersionId);
  }

  async saveFulfillment(serviceVersionId: string, dto: SaveFulfillmentDto) {
    await this.bundleService.ensureDraft(serviceVersionId);

    const config = await this.prisma.serviceFulfillmentConfig.findUnique({
      where: { serviceVersionId },
    });
    if (!config) {
      throw new NotFoundException('Fulfillment config not found');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.serviceFulfillmentConfig.update({
        where: { id: config.id },
        data: {
          ...(dto.assistedEnabled !== undefined
            ? { assistedEnabled: dto.assistedEnabled }
            : {}),
          ...(dto.manualEnabled !== undefined ? { manualEnabled: dto.manualEnabled } : {}),
          ...(dto.assistedCtaLabel !== undefined
            ? { assistedCtaLabel: dto.assistedCtaLabel }
            : {}),
          ...(dto.manualCtaLabel !== undefined
            ? { manualCtaLabel: dto.manualCtaLabel }
            : {}),
          ...(dto.requiresStateSelection !== undefined
            ? { requiresStateSelection: dto.requiresStateSelection }
            : {}),
          ...(dto.defaultPlatformFee !== undefined
            ? { defaultPlatformFee: dto.defaultPlatformFee }
            : {}),
          ...(dto.defaultPortalUrl !== undefined
            ? { defaultPortalUrl: dto.defaultPortalUrl }
            : {}),
          ...(dto.manualInstructions !== undefined
            ? { manualInstructions: dto.manualInstructions }
            : {}),
        },
      });

      if (dto.stateVariants) {
        await tx.serviceStateVariant.deleteMany({
          where: { fulfillmentConfigId: config.id },
        });
        if (dto.stateVariants.length) {
          await tx.serviceStateVariant.createMany({
            data: dto.stateVariants.map((v, index) => ({
              fulfillmentConfigId: config.id,
              stateCode: v.stateCode,
              stateName: v.stateName,
              assistedEnabled: v.assistedEnabled ?? true,
              manualEnabled: v.manualEnabled ?? true,
              officialPortalUrl: v.officialPortalUrl,
              platformFee:
                v.platformFee != null ? new Prisma.Decimal(v.platformFee) : null,
              baseFeeOverride:
                v.baseFeeOverride != null
                  ? new Prisma.Decimal(v.baseFeeOverride)
                  : null,
              processingTime: v.processingTime,
              department: v.department,
              sortOrder: v.sortOrder ?? index,
            })),
          });
        }
      }
    });

    return this.bundleService.getFullBundle(serviceVersionId);
  }

  async saveWorkflow(serviceVersionId: string, dto: SaveWorkflowDto) {
    await this.bundleService.ensureDraft(serviceVersionId);

    const workflow = await this.prisma.workflowDefinition.findUnique({
      where: { serviceVersionId },
      include: { steps: true, transitions: true },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.workflowTransition.deleteMany({
        where: { workflowDefinitionId: workflow.id },
      });
      await tx.workflowStep.deleteMany({
        where: { workflowDefinitionId: workflow.id },
      });

      const stepIdByKey = new Map<string, string>();

      for (const [index, step] of dto.steps.entries()) {
        const created = await tx.workflowStep.create({
          data: {
            workflowDefinitionId: workflow.id,
            stepKey: step.stepKey,
            name: step.name,
            description: step.description,
            sortOrder: step.sortOrder ?? index,
            applicationStatus: step.applicationStatus as ApplicationStatus,
            isInitial: step.isInitial ?? false,
            isTerminal: step.isTerminal ?? false,
            citizenVisible: step.citizenVisible ?? true,
            slaHours: step.slaHours,
          },
        });
        stepIdByKey.set(step.stepKey, created.id);
      }

      for (const transition of dto.transitions) {
        const fromStepId = stepIdByKey.get(transition.fromStepKey);
        const toStepId = stepIdByKey.get(transition.toStepKey);

        if (!fromStepId || !toStepId) {
          throw new BadRequestException(
            `Invalid workflow transition: ${transition.fromStepKey} -> ${transition.toStepKey}`,
          );
        }

        await tx.workflowTransition.create({
          data: {
            workflowDefinitionId: workflow.id,
            fromStepId,
            toStepId,
            actionKey: transition.actionKey,
            label: transition.label,
            allowedRoleIds: transition.allowedRoleIds ?? [],
            requiredPermissions: transition.requiredPermissions ?? [],
            requiresComment: transition.requiresComment ?? false,
            requiresAssignment: transition.requiresAssignment ?? false,
            createsActionRequest: transition.createsActionRequest ?? false,
            notifyCitizen: transition.notifyCitizen ?? false,
            guardConfig: (transition.guardConfig ?? {}) as Prisma.InputJsonValue,
          },
        });
      }
    });

    return this.bundleService.getFullBundle(serviceVersionId);
  }
}

@Injectable()
export class ServiceVersionsPublishService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bundleService: ServiceVersionsBundleService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async validate(serviceVersionId: string) {
    const bundle = await this.bundleService.getFullBundle(serviceVersionId);
    const errors: string[] = [];

    if (bundle.lifecycleStatus !== ServiceVersionLifecycleStatus.DRAFT) {
      errors.push('Only draft versions can be validated for publish');
    }

    if (!bundle.overview?.displayName?.trim()) {
      errors.push('Overview display name is required');
    }

    if (
      bundle.fulfillmentConfig?.assistedEnabled !== false &&
      !bundle.formVersion?.fields.length
    ) {
      errors.push('At least one form field is required for assisted apply');
    }

    if (
      bundle.fulfillmentConfig?.manualEnabled &&
      !bundle.fulfillmentConfig.defaultPortalUrl &&
      !bundle.fulfillmentConfig.stateVariants.some((v) => v.officialPortalUrl)
    ) {
      errors.push(
        'Manual apply requires a default portal URL or at least one state portal URL',
      );
    }

    if (
      bundle.fulfillmentConfig?.requiresStateSelection &&
      !bundle.fulfillmentConfig.stateVariants.length
    ) {
      errors.push(
        'At least one state must be configured when state selection is required',
      );
    }

    if (
      bundle.fulfillmentConfig?.requiresStateSelection &&
      bundle.fulfillmentConfig.stateVariants.some(
        (v) => !v.stateCode?.trim() || !v.stateName?.trim(),
      )
    ) {
      errors.push('Each configured state must have a valid state code and name');
    }

    if (!bundle.formVersion?.fields.length) {
      // legacy check removed - handled above for assisted
    } else {
      const fieldKeys = bundle.formVersion.fields.map((f) => f.key);
      if (new Set(fieldKeys).size !== fieldKeys.length) {
        errors.push('Duplicate form field keys detected');
      }
    }

    if (
      bundle.fulfillmentConfig?.assistedEnabled !== false &&
      (!bundle.pricingConfig || Number(bundle.pricingConfig.baseFee) < 0)
    ) {
      errors.push('Valid pricing configuration is required for assisted apply');
    }

    if (
      !bundle.fulfillmentConfig?.assistedEnabled &&
      !bundle.fulfillmentConfig?.manualEnabled
    ) {
      errors.push('At least one fulfillment path (assisted or manual) must be enabled');
    }

    const initialSteps =
      bundle.workflowDefinition?.steps.filter((s) => s.isInitial) ?? [];
    if (initialSteps.length !== 1) {
      errors.push('Workflow must have exactly one initial step');
    }

    const terminalSteps =
      bundle.workflowDefinition?.steps.filter((s) => s.isTerminal) ?? [];
    if (!terminalSteps.length) {
      errors.push('Workflow must have at least one terminal step');
    }

    if (!bundle.workflowDefinition?.transitions.length) {
      errors.push('Workflow transitions are required');
    }

    return {
      valid: errors.length === 0,
      errors,
      checklist: {
        overview: Boolean(bundle.overview?.displayName),
        formFields: bundle.formVersion?.fields.length ?? 0,
        documents: bundle.documentRequirements.length,
        pricing: Boolean(bundle.pricingConfig),
        workflowSteps: bundle.workflowDefinition?.steps.length ?? 0,
        workflowTransitions: bundle.workflowDefinition?.transitions.length ?? 0,
      },
    };
  }

  async publish(serviceVersionId: string, adminUserId: string) {
    const validation = await this.validate(serviceVersionId);
    if (!validation.valid) {
      throw new BadRequestException({
        message: 'Publish validation failed',
        details: validation.errors,
      });
    }

    const version = await this.prisma.serviceVersion.update({
      where: { id: serviceVersionId },
      data: {
        lifecycleStatus: ServiceVersionLifecycleStatus.PUBLISHED,
        publishedAt: new Date(),
        publishedById: adminUserId,
      },
    });

    await this.prisma.formVersion.updateMany({
      where: { serviceVersionId },
      data: { status: 'PUBLISHED' },
    });

    await this.prisma.serviceVersion.updateMany({
      where: {
        subServiceId: version.subServiceId,
        id: { not: serviceVersionId },
        lifecycleStatus: ServiceVersionLifecycleStatus.PUBLISHED,
      },
      data: { lifecycleStatus: ServiceVersionLifecycleStatus.UNPUBLISHED },
    });

    await this.auditLogService.log(
      adminUserId,
      'SERVICE_VERSION_PUBLISHED',
      'service_version',
      serviceVersionId,
      { subServiceId: version.subServiceId, versionNumber: version.versionNumber },
    );

    return this.bundleService.getFullBundle(serviceVersionId);
  }

  async unpublish(serviceVersionId: string) {
    const version = await this.bundleService.getFullBundle(serviceVersionId);

    if (version.lifecycleStatus !== ServiceVersionLifecycleStatus.PUBLISHED) {
      throw new BadRequestException('Only published versions can be unpublished');
    }

    return this.prisma.serviceVersion.update({
      where: { id: serviceVersionId },
      data: { lifecycleStatus: ServiceVersionLifecycleStatus.UNPUBLISHED },
    });
  }

  async archive(serviceVersionId: string) {
    await this.bundleService.ensureDraft(serviceVersionId).catch(() => null);

    const version = await this.prisma.serviceVersion.findUnique({
      where: { id: serviceVersionId },
    });

    if (!version) {
      throw new NotFoundException('Service version not found');
    }

    if (version.lifecycleStatus === ServiceVersionLifecycleStatus.PUBLISHED) {
      throw new BadRequestException('Unpublish before archiving');
    }

    return this.prisma.serviceVersion.update({
      where: { id: serviceVersionId },
      data: { lifecycleStatus: ServiceVersionLifecycleStatus.ARCHIVED },
    });
  }
}
