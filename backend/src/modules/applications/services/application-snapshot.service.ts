import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import type { WorkflowSnapshot } from '@/common/constants/application-state-machine';
import { PrismaService } from '@/database/database.module';
import { ServiceVersionsBundleService } from '@/modules/service-versions/services/service-versions-bundle.service';
import { ServicesCatalogMapper } from '@/modules/service-versions/services/services-catalog.mapper';
import { calculateAssistedTotalAmount } from '@/modules/service-versions/utils/assisted-pricing.util';

@Injectable()
export class ApplicationSnapshotService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bundleService: ServiceVersionsBundleService,
    private readonly catalogMapper: ServicesCatalogMapper,
  ) {}

  async createSnapshots(applicationId: string, serviceVersionId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      select: { applicantStateCode: true },
    });
    const stateCode = application?.applicantStateCode ?? undefined;

    const bundle = await this.bundleService.getFullBundle(serviceVersionId);
    const configPayload = this.catalogMapper.toConfigurationResponse(
      bundle,
      stateCode,
    );

    const workflowSnapshot = this.buildWorkflowSnapshot(bundle);
    const payload = {
      ...configPayload,
      workflow: workflowSnapshot,
    };

    const pricing = bundle.pricingConfig;
    const baseFee = pricing ? Number(pricing.baseFee) : 0;
    const taxRate = pricing ? Number(pricing.taxRate) : 0;
    const taxAmount =
      pricing?.taxEnabled && pricing ? (baseFee * taxRate) / 100 : 0;
    const additionalCharges =
      pricing?.additionalCharges.map((charge) => ({
        name: charge.name,
        amount: charge.amount.toString(),
        condition: charge.condition,
      })) ?? [];
    const additionalTotal = additionalCharges.reduce(
      (sum, charge) => sum + Number(charge.amount),
      0,
    );
    const totalAmount = calculateAssistedTotalAmount(
      bundle.pricingConfig,
      bundle.fulfillmentConfig,
      stateCode,
    );

    await this.prisma.$transaction([
      this.prisma.applicationConfigSnapshot.create({
        data: {
          applicationId,
          payload: payload as unknown as Prisma.InputJsonValue,
        },
      }),
      this.prisma.applicationPricingSnapshot.create({
        data: {
          applicationId,
          baseFee: new Prisma.Decimal(baseFee),
          taxAmount: new Prisma.Decimal(taxAmount),
          taxRate: new Prisma.Decimal(taxRate),
          currency: pricing?.currency ?? 'INR',
          additionalCharges: additionalCharges as Prisma.InputJsonValue,
          discountAmount: new Prisma.Decimal(0),
          totalAmount: new Prisma.Decimal(totalAmount),
        },
      }),
    ]);

    return { configPayload: payload, totalAmount };
  }

  getWorkflowFromSnapshot(
    configSnapshot: { payload: unknown } | null,
  ): WorkflowSnapshot | null {
    if (!configSnapshot?.payload || typeof configSnapshot.payload !== 'object') {
      return null;
    }

    const payload = configSnapshot.payload as Record<string, unknown>;
    const workflow = payload.workflow;
    if (!workflow || typeof workflow !== 'object') {
      return null;
    }

    return workflow as WorkflowSnapshot;
  }

  private buildWorkflowSnapshot(
    bundle: Awaited<
      ReturnType<ServiceVersionsBundleService['getFullBundle']>
    >,
  ): WorkflowSnapshot {
    const steps = bundle.workflowDefinition?.steps ?? [];
    const transitions = bundle.workflowDefinition?.transitions ?? [];
    const stepById = new Map(steps.map((step) => [step.id, step]));

    return {
      steps: steps.map((step) => ({
        stepKey: step.stepKey,
        name: step.name,
        applicationStatus: step.applicationStatus,
        isInitial: step.isInitial,
        isTerminal: step.isTerminal,
        citizenVisible: step.citizenVisible,
      })),
      transitions: transitions.map((transition) => {
        const fromStep = stepById.get(transition.fromStepId);
        const toStep = stepById.get(transition.toStepId);
        return {
          actionKey: transition.actionKey,
          label: transition.label,
          fromStepKey: fromStep?.stepKey ?? '',
          toStepKey: toStep?.stepKey ?? '',
          fromApplicationStatus:
            fromStep?.applicationStatus ?? 'SUBMITTED',
          toApplicationStatus: toStep?.applicationStatus ?? 'SUBMITTED',
          requiredPermissions: transition.requiredPermissions,
          allowedRoleIds: transition.allowedRoleIds,
          requiresComment: transition.requiresComment,
          requiresAssignment: transition.requiresAssignment,
          createsActionRequest: transition.createsActionRequest,
          notifyCitizen: transition.notifyCitizen,
        };
      }),
    };
  }
}
