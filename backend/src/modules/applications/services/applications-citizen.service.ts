import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ApplicationStatus,
  PaymentStatus,
  Prisma,
  ServiceVersionLifecycleStatus,
  StoredFileStatus,
  UploadSessionStatus,
} from '@prisma/client';
import { randomUUID } from 'crypto';

import type { UploadedFilePayload } from '@/common/types/uploaded-file.type';
import { getStateName } from '@/common/constants/indian-states.constants';
import {
  mimeMatchesRequirement,
  normalizeMimeType,
} from '@/common/utils/mime.util';
import {
  paginate,
  paginationMeta,
} from '@/common/dto/pagination.dto';
import { PrismaService } from '@/database/database.module';
import { LocalStorageProvider } from '@/integrations/storage/local-storage.provider';
import { StorageService } from '@/integrations/storage/storage.service';
import { ServiceVersionsBundleService } from '@/modules/service-versions/services/service-versions-bundle.service';
import { calculateAssistedTotalAmount } from '@/modules/service-versions/utils/assisted-pricing.util';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { PaymentsService } from '@/modules/payments/payments.service';
import { generateApplicationPublicRef } from '../constants/public-ref.util';
import { CompleteUploadDto } from '../dto/citizen-application.dto';
import { ApplicationSnapshotService } from './application-snapshot.service';
import { ApplicationStateMachineService } from './application-state-machine.service';
import { ApplicationValidationService } from './application-validation.service';

const UPLOAD_SESSION_TTL_MS = 15 * 60 * 1000;

function toPrismaJson(value: unknown): Prisma.InputJsonValue {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  try {
    const serialized = JSON.stringify(value);
    if (!serialized || serialized === 'null' || serialized === 'undefined') return '';
    return JSON.parse(serialized) as Prisma.InputJsonValue;
  } catch {
    return String(value);
  }
}

@Injectable()
export class ApplicationsCitizenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly localStorageProvider: LocalStorageProvider,
    private readonly bundleService: ServiceVersionsBundleService,
    private readonly snapshotService: ApplicationSnapshotService,
    private readonly validationService: ApplicationValidationService,
    private readonly stateMachine: ApplicationStateMachineService,
    private readonly paymentsService: PaymentsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createDraft(
    subServiceId: string,
    citizenId: string,
    stateCode?: string,
    stateName?: string,
  ) {
    const publishedVersion = await this.prisma.serviceVersion.findFirst({
      where: {
        subServiceId,
        lifecycleStatus: ServiceVersionLifecycleStatus.PUBLISHED,
      },
      orderBy: { versionNumber: 'desc' },
      include: {
        formVersion: true,
        workflowDefinition: true,
        fulfillmentConfig: {
          include: { stateVariants: true },
        },
      },
    });

    if (!publishedVersion?.formVersion || !publishedVersion.workflowDefinition) {
      throw new NotFoundException(
        'No published service configuration found for this sub-service',
      );
    }

    if (
      publishedVersion.fulfillmentConfig?.assistedEnabled === false
    ) {
      throw new BadRequestException(
        'Assisted apply is not available for this service. Use manual apply.',
      );
    }

    const normalizedState = stateCode?.toUpperCase();
    const fulfillment = publishedVersion.fulfillmentConfig;

    if (fulfillment?.requiresStateSelection) {
      if (!normalizedState) {
        throw new BadRequestException('State selection is required');
      }
      const hasVariant = fulfillment.stateVariants.some(
        (v) => v.stateCode === normalizedState,
      );
      if (!hasVariant) {
        throw new BadRequestException(
          'This service is not available in the selected state',
        );
      }
    }

    return this.prisma.application.create({
      data: {
        citizenId,
        serviceVersionId: publishedVersion.id,
        formVersionId: publishedVersion.formVersion.id,
        workflowDefinitionId: publishedVersion.workflowDefinition.id,
        status: ApplicationStatus.DRAFT,
        applicantStateCode: normalizedState,
        applicantStateName:
          stateName ?? (normalizedState ? getStateName(normalizedState) : undefined),
      },
      include: this.citizenDetailInclude(),
    });
  }

  async listDrafts(citizenId: string) {
    return this.prisma.application.findMany({
      where: {
        citizenId,
        status: {
          in: [
            ApplicationStatus.DRAFT,
            ApplicationStatus.FORM_IN_PROGRESS,
            ApplicationStatus.DOCUMENTS_PENDING,
            ApplicationStatus.PAYMENT_PENDING,
          ],
        },
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        serviceVersion: {
          include: {
            overview: true,
            subService: { include: { mainService: true } },
          },
        },
      },
    });
  }

  async listApplications(
    citizenId: string,
    query: { status?: string; page?: number; limit?: number },
  ) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);
    const where = {
      citizenId,
      ...(query.status
        ? { status: query.status as ApplicationStatus }
        : {
            status: {
              notIn: [
                ApplicationStatus.DRAFT,
                ApplicationStatus.FORM_IN_PROGRESS,
                ApplicationStatus.DOCUMENTS_PENDING,
                ApplicationStatus.PAYMENT_PENDING,
              ],
            },
          }),
    };

    const [items, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        include: {
          serviceVersion: {
            include: {
              overview: true,
              subService: { include: { mainService: true } },
            },
          },
        },
      }),
      this.prisma.application.count({ where }),
    ]);

    return {
      data: items,
      meta: paginationMeta(total, page, limit),
    };
  }

  async getById(applicationId: string, citizenId: string) {
    const application = await this.findOwnedApplication(
      applicationId,
      citizenId,
    );
    return application;
  }

  async saveFormValues(
    applicationId: string,
    citizenId: string,
    values: Record<string, unknown>,
  ) {
    const application = await this.findOwnedApplication(
      applicationId,
      citizenId,
    );
    this.stateMachine.assertCanModifyDraft(application.status);

    const formVersion = await this.prisma.formVersion.findUnique({
      where: { id: application.formVersionId },
      include: {
        fields: { include: { options: true }, orderBy: { sortOrder: 'asc' } },
        conditions: true,
      },
    });

    if (!formVersion) {
      throw new NotFoundException('Form version not found');
    }

    const nextStatus =
      application.status === ApplicationStatus.DRAFT
        ? ApplicationStatus.FORM_IN_PROGRESS
        : application.status;

    if (nextStatus !== application.status) {
      this.stateMachine.assertPreSubmitTransition(
        application.status,
        nextStatus,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      for (const [fieldKey, value] of Object.entries(values)) {
        const jsonValue = toPrismaJson(value);
        await tx.applicationFieldValue.upsert({
          where: {
            applicationId_fieldKey: { applicationId, fieldKey },
          },
          create: { applicationId, fieldKey, value: jsonValue },
          update: { value: jsonValue },
        });
      }

      if (nextStatus !== application.status) {
        await tx.application.update({
          where: { id: applicationId },
          data: { status: nextStatus },
        });
        await tx.applicationStatusHistory.create({
          data: {
            applicationId,
            fromStatus: application.status,
            toStatus: nextStatus,
            actionKey: 'SAVE_FORM',
          },
        });
      }
    });

    return this.getById(applicationId, citizenId);
  }

  async requestUpload(
    applicationId: string,
    citizenId: string,
    dto: { documentRequirementId: string; originalFileName: string; mimeType: string },
  ) {
    const application = await this.findOwnedApplication(
      applicationId,
      citizenId,
    );
    this.stateMachine.assertCanModifyDocuments(application.status);

    const requirement = await this.prisma.documentRequirement.findFirst({
      where: {
        id: dto.documentRequirementId,
        serviceVersionId: application.serviceVersionId,
      },
    });

    if (!requirement) {
      throw new NotFoundException('Document requirement not found');
    }

    const normalizedMime = normalizeMimeType(dto.mimeType, dto.originalFileName);
    if (
      !mimeMatchesRequirement(
        normalizedMime,
        dto.originalFileName,
        requirement.allowedMimeTypes,
        requirement.allowedFormats,
      )
    ) {
      throw new BadRequestException(
        `File type not allowed. Accepted: ${requirement.allowedFormats.join(', ') || requirement.allowedMimeTypes.join(', ')}`,
      );
    }

    const storageKey = this.storageService.generateStorageKey(
      citizenId,
      dto.originalFileName,
    );
    const expiresAt = new Date(Date.now() + UPLOAD_SESSION_TTL_MS);

    const uploadSession = await this.prisma.uploadSession.create({
      data: {
        citizenId,
        applicationId,
        documentRequirementId: requirement.id,
        expectedMimeType: normalizedMime,
        expectedMaxSizeBytes: Math.max(requirement.maxFileSizeBytes || 0, 10 * 1024 * 1024),
        originalFileName: dto.originalFileName,
        status: UploadSessionStatus.PENDING,
        expiresAt,
      },
    });

    const storedFile = await this.prisma.storedFile.create({
      data: {
        uploadSessionId: uploadSession.id,
        ownerCitizenId: citizenId,
        storageProvider: 'LOCAL',
        storageKey,
        originalFileName: dto.originalFileName,
        mimeType: normalizedMime,
        status: StoredFileStatus.PENDING,
      },
    });

    const maxSizeBytes = Math.max(requirement.maxFileSizeBytes || 0, 10 * 1024 * 1024);

    const presigned = await this.storageService.requestUploadUrl({
      storageKey,
      mimeType: normalizedMime,
      maxSizeBytes,
      originalFileName: dto.originalFileName,
    });

    return {
      uploadSessionId: uploadSession.id,
      storedFileId: storedFile.id,
      ...presigned,
    };
  }

  async uploadSessionFile(
    applicationId: string,
    citizenId: string,
    uploadSessionId: string,
    file: UploadedFilePayload,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('File is required');
    }

    await this.findOwnedApplication(applicationId, citizenId);

    const uploadSession = await this.prisma.uploadSession.findFirst({
      where: {
        id: uploadSessionId,
        citizenId,
        applicationId,
      },
    });

    if (!uploadSession) {
      throw new NotFoundException('Upload session not found');
    }

    if (uploadSession.status !== UploadSessionStatus.PENDING) {
      throw new BadRequestException('Upload session is no longer active');
    }

    if (uploadSession.expiresAt.getTime() < Date.now()) {
      await this.prisma.uploadSession.update({
        where: { id: uploadSession.id },
        data: { status: UploadSessionStatus.EXPIRED },
      });
      throw new BadRequestException('Upload session has expired');
    }

    const storedFile = await this.prisma.storedFile.findFirst({
      where: {
        ownerCitizenId: citizenId,
        uploadSessionId: uploadSession.id,
      },
    });

    if (!storedFile) {
      throw new NotFoundException('Stored file not found');
    }

    const metadata = await this.storageService.saveUploadedBytes(
      storedFile.storageKey,
      file.buffer,
      uploadSession.expectedMaxSizeBytes,
    );

    return {
      success: true,
      storageKey: storedFile.storageKey,
      sizeBytes: metadata.sizeBytes,
    };
  }

  async completeUpload(
    applicationId: string,
    citizenId: string,
    dto: CompleteUploadDto,
  ) {
    const application = await this.findOwnedApplication(
      applicationId,
      citizenId,
    );
    this.stateMachine.assertCanModifyDocuments(application.status);

    const uploadSession = await this.prisma.uploadSession.findFirst({
      where: {
        id: dto.uploadSessionId,
        citizenId,
        applicationId,
      },
    });

    if (!uploadSession) {
      throw new NotFoundException('Upload session not found');
    }

    if (uploadSession.status !== UploadSessionStatus.PENDING) {
      throw new BadRequestException('Upload session is no longer active');
    }

    if (uploadSession.expiresAt.getTime() < Date.now()) {
      await this.prisma.uploadSession.update({
        where: { id: uploadSession.id },
        data: { status: UploadSessionStatus.EXPIRED },
      });
      throw new BadRequestException('Upload session has expired');
    }

    const storedFile = await this.prisma.storedFile.findFirst({
      where: {
        id: dto.storedFileId,
        ownerCitizenId: citizenId,
        uploadSessionId: uploadSession.id,
      },
    });

    if (!storedFile) {
      throw new NotFoundException('Stored file not found');
    }

    const metadata = await this.storageService.verifyObject(storedFile.storageKey);
    if (!metadata.exists || metadata.sizeBytes <= 0) {
      throw new BadRequestException(
        'Uploaded file was not found in storage. Complete the upload first.',
      );
    }

    if (metadata.sizeBytes > uploadSession.expectedMaxSizeBytes) {
      throw new BadRequestException('Uploaded file exceeds maximum allowed size');
    }

    const requirementId = uploadSession.documentRequirementId;
    if (!requirementId) {
      throw new BadRequestException('Upload session is missing document requirement');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.storedFile.update({
        where: { id: storedFile.id },
        data: {
          status: StoredFileStatus.UPLOADED,
          sizeBytes: metadata.sizeBytes,
          verifiedAt: new Date(),
        },
      });

      await tx.uploadSession.update({
        where: { id: uploadSession.id },
        data: { status: UploadSessionStatus.COMPLETED },
      });

      await tx.applicationDocument.deleteMany({
        where: {
          applicationId,
          documentRequirementId: requirementId,
        },
      });

      await tx.applicationDocument.create({
        data: {
          applicationId,
          documentRequirementId: requirementId,
          storedFileId: storedFile.id,
          status: 'SUBMITTED',
        },
      });

      if (
        application.status === ApplicationStatus.FORM_IN_PROGRESS ||
        application.status === ApplicationStatus.DRAFT
      ) {
        const nextStatus = ApplicationStatus.DOCUMENTS_PENDING;
        this.stateMachine.assertPreSubmitTransition(
          application.status,
          nextStatus,
        );
        await tx.application.update({
          where: { id: applicationId },
          data: { status: nextStatus },
        });
        await tx.applicationStatusHistory.create({
          data: {
            applicationId,
            fromStatus: application.status,
            toStatus: nextStatus,
            actionKey: 'DOCUMENT_UPLOADED',
          },
        });
      }
    });

    return this.getById(applicationId, citizenId);
  }

  async validateApplication(
    applicationId: string,
    citizenId: string,
    scope?: 'form' | 'documents' | 'all',
  ) {
    const application = await this.findOwnedApplication(
      applicationId,
      citizenId,
    );
    this.stateMachine.assertCanModifyDraft(application.status);

    const result = await this.validationService.validateApplication(
      applicationId,
      { scope: scope ?? 'all' },
    );

    if (result.valid) {
      const bundle = await this.bundleService.getFullBundle(
        application.serviceVersionId,
      );
      const hasDocs = bundle.documentRequirements.some((d) => d.required);
      const totalAmount = this.calculateTotalFromBundle(
        bundle,
        application.applicantStateCode,
      );

      let targetStatus = this.stateMachine.suggestNextPreSubmitStatus(
        hasDocs,
        totalAmount,
        true,
        !hasDocs ||
          bundle.documentRequirements
            .filter((d) => d.required)
            .every((req) =>
              application.documents.some(
                (doc) => doc.documentRequirementId === req.id,
              ),
            ),
      );

      if (
        targetStatus &&
        targetStatus !== application.status &&
        !this.stateMachine.requiresPayment(totalAmount) &&
        targetStatus === ApplicationStatus.PAYMENT_PENDING
      ) {
        targetStatus = ApplicationStatus.PAYMENT_PENDING;
      }

      if (targetStatus && targetStatus !== application.status) {
        this.stateMachine.assertPreSubmitTransition(
          application.status,
          targetStatus,
        );
        await this.prisma.$transaction([
          this.prisma.application.update({
            where: { id: applicationId },
            data: { status: targetStatus },
          }),
          this.prisma.applicationStatusHistory.create({
            data: {
              applicationId,
              fromStatus: application.status,
              toStatus: targetStatus,
              actionKey: 'VALIDATE',
            },
          }),
        ]);
      }
    }

    return {
      ...result,
      application: await this.getById(applicationId, citizenId),
    };
  }

  async createPaymentIntent(
    applicationId: string,
    citizenId: string,
    idempotencyKey: string,
  ) {
    const application = await this.findOwnedApplication(
      applicationId,
      citizenId,
    );
    this.stateMachine.assertCanModifyDraft(application.status);

    const validation = await this.validationService.validateApplication(
      applicationId,
    );
    if (!validation.valid) {
      throw new BadRequestException({
        message: 'Application must pass validation before payment',
        errors: validation.errors,
      });
    }

    const bundle = await this.bundleService.getFullBundle(
      application.serviceVersionId,
    );
    const totalAmount = this.calculateTotalFromBundle(
      bundle,
      application.applicantStateCode,
    );

    if (totalAmount <= 0) {
      throw new BadRequestException('No payment required for this application');
    }

    const existing = await this.prisma.payment.findUnique({
      where: { idempotencyKey },
    });

    if (existing) {
      if (existing.applicationId !== applicationId) {
        throw new ConflictException('Idempotency key already used');
      }
      return this.formatPaymentIntent(existing);
    }

    const payment = await this.paymentsService.createForApplication(
      applicationId,
      citizenId,
      idempotencyKey,
    );

    if (application.status !== ApplicationStatus.PAYMENT_PENDING) {
      this.stateMachine.assertPreSubmitTransition(
        application.status,
        ApplicationStatus.PAYMENT_PENDING,
      );
      await this.prisma.$transaction([
        this.prisma.application.update({
          where: { id: applicationId },
          data: { status: ApplicationStatus.PAYMENT_PENDING },
        }),
        this.prisma.applicationStatusHistory.create({
          data: {
            applicationId,
            fromStatus: application.status,
            toStatus: ApplicationStatus.PAYMENT_PENDING,
            actionKey: 'PAYMENT_INTENT',
          },
        }),
      ]);
    }

    return this.formatPaymentIntent(payment);
  }

  async submitApplication(applicationId: string, citizenId: string) {
    const application = await this.findOwnedApplication(
      applicationId,
      citizenId,
    );

    const version = await this.prisma.serviceVersion.findUnique({
      where: { id: application.serviceVersionId },
    });

    if (version?.lifecycleStatus !== ServiceVersionLifecycleStatus.PUBLISHED) {
      throw new BadRequestException(
        'Service is no longer published. Cannot submit this application.',
      );
    }

    const validation = await this.validationService.validateApplication(
      applicationId,
    );
    if (!validation.valid) {
      throw new BadRequestException({
        message: 'Application validation failed',
        errors: validation.errors,
      });
    }

    await this.ensurePaymentVerified(applicationId, application.status);

    const bundle = await this.bundleService.getFullBundle(
      application.serviceVersionId,
    );
    const submittedStep = bundle.workflowDefinition?.steps.find(
      (s) => s.applicationStatus === ApplicationStatus.SUBMITTED,
    );

    const publicRef = await this.generateUniquePublicRef();
    const fromStatus = application.status;
    const totalAmount = this.calculateTotalFromBundle(
      bundle,
      application.applicantStateCode,
    );

    if (
      fromStatus !== ApplicationStatus.PAYMENT_PENDING ||
      totalAmount <= 0
    ) {
      this.stateMachine.assertPreSubmitTransition(
        fromStatus,
        ApplicationStatus.SUBMITTED,
      );
    }

    await this.snapshotService.createSnapshots(
      applicationId,
      application.serviceVersionId,
    );

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.application.update({
        where: { id: applicationId },
        data: {
          status: ApplicationStatus.SUBMITTED,
          publicRef,
          submittedAt: new Date(),
          currentWorkflowStepId: submittedStep?.id ?? null,
        },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId,
          fromStatus,
          toStatus: ApplicationStatus.SUBMITTED,
          actionKey: 'SUBMIT',
        },
      });

      return tx.application.findUniqueOrThrow({
        where: { id: applicationId },
        include: this.citizenDetailInclude(),
      });
    });

    await this.notifyApplicationSubmitted(updated);

    return updated;
  }

  private async notifyApplicationSubmitted(application: {
    id: string;
    citizenId: string;
    publicRef: string | null;
    serviceVersion?: {
      overview?: { displayName?: string | null } | null;
      subService?: { name: string } | null;
    } | null;
  }) {
    const serviceName =
      application.serviceVersion?.overview?.displayName ??
      application.serviceVersion?.subService?.name ??
      'your service';
    const ref = application.publicRef ?? application.id;

    try {
      await this.notificationsService.create({
        citizenId: application.citizenId,
        title: 'Application submitted',
        body: `Your ${serviceName} application (${ref}) has been submitted. We will notify you as it is reviewed.`,
        metadata: {
          applicationId: application.id,
          publicRef: application.publicRef,
          status: ApplicationStatus.SUBMITTED,
        },
      });

      const admins = await this.prisma.adminUser.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true },
      });

      await Promise.all(
        admins.map(admin =>
          this.notificationsService.create({
            adminUserId: admin.id,
            title: 'New application submitted',
            body: `${serviceName} application ${ref} is ready for review.`,
            metadata: {
              applicationId: application.id,
              publicRef: application.publicRef,
              status: ApplicationStatus.SUBMITTED,
            },
          }),
        ),
      );
    } catch {
      // Submission must succeed even if notification delivery fails.
    }
  }

  async submitCorrection(
    applicationId: string,
    citizenId: string,
    values: Record<string, unknown>,
  ) {
    const application = await this.findOwnedApplication(
      applicationId,
      citizenId,
    );
    this.stateMachine.assertCanSubmitCorrection(application.status);

    const openRequest = await this.prisma.applicationActionRequest.findFirst({
      where: { applicationId, status: 'OPEN' },
      orderBy: { createdAt: 'desc' },
    });

    if (!openRequest) {
      throw new BadRequestException('No open correction request found');
    }

    if (Object.keys(values).length > 0) {
      const allowedKeys = new Set(openRequest.requiredFieldKeys);
      const formVersion = await this.prisma.formVersion.findUnique({
        where: { id: application.formVersionId },
        include: {
          fields: { include: { options: true } },
          conditions: true,
        },
      });

      if (!formVersion) {
        throw new NotFoundException('Form version not found');
      }

      const filteredValues = Object.fromEntries(
        Object.entries(values).filter(([key]) =>
          allowedKeys.size === 0 ? true : allowedKeys.has(key),
        ),
      );

      const errors = this.validationService.validateFieldValues(
        formVersion.fields,
        formVersion.conditions,
        filteredValues,
        { onlyKeys: allowedKeys.size > 0 ? allowedKeys : undefined },
      );

      if (errors.length > 0) {
        throw new BadRequestException({ message: 'Invalid correction values', errors });
      }

      for (const [fieldKey, value] of Object.entries(filteredValues)) {
        await this.prisma.applicationFieldValue.upsert({
          where: { applicationId_fieldKey: { applicationId, fieldKey } },
          create: { applicationId, fieldKey, value: toPrismaJson(value) },
          update: { value: toPrismaJson(value) },
        });
      }
    }

    const validation = await this.validationService.validateApplication(
      applicationId,
    );
    const scopedErrors = validation.errors.filter((error) => {
      if (openRequest.requiredFieldKeys.length === 0 && openRequest.requiredDocumentIds.length === 0) {
        return true;
      }
      if (error.field.startsWith('document:')) {
        const docId = error.field.replace('document:', '');
        return openRequest.requiredDocumentIds.includes(docId);
      }
      return openRequest.requiredFieldKeys.includes(error.field);
    });

    if (scopedErrors.length > 0) {
      throw new BadRequestException({
        message: 'Correction validation failed',
        errors: scopedErrors,
      });
    }

    await this.prisma.applicationActionRequest.update({
      where: { id: openRequest.id },
      data: { status: 'RESOLVED', resolvedAt: new Date() },
    });

    await this.resumeReviewAfterCorrection(application);

    return this.getById(applicationId, citizenId);
  }

  private async resumeReviewAfterCorrection(application: {
    id: string;
    status: ApplicationStatus;
    configSnapshot: { payload: unknown } | null;
    currentWorkflowStep: { stepKey: string } | null;
    workflowDefinitionId: string;
  }) {
    if (application.status !== ApplicationStatus.ACTION_REQUIRED) {
      return;
    }

    const workflow = this.snapshotService.getWorkflowFromSnapshot(
      application.configSnapshot,
    );
    if (!workflow) {
      return;
    }

    const fromStepKey =
      application.currentWorkflowStep?.stepKey ?? 'action_required';
    const resumeTransition =
      workflow.transitions.find(
        (t) =>
          t.fromStepKey === fromStepKey &&
          (t.actionKey === 'RESUME_REVIEW' || t.actionKey === 'RESUME_PROCESSING'),
      ) ??
      workflow.transitions.find(
        (t) =>
          t.fromStepKey === fromStepKey &&
          (t.toStepKey === 'under_review' || t.toStepKey === 'processing'),
      );

    if (!resumeTransition) {
      return;
    }

    const toStep = workflow.steps.find(
      (s) => s.stepKey === resumeTransition.toStepKey,
    );
    if (!toStep) {
      return;
    }

    const toWorkflowStep = await this.prisma.workflowStep.findFirst({
      where: {
        workflowDefinitionId: application.workflowDefinitionId,
        stepKey: toStep.stepKey,
      },
    });

    await this.prisma.$transaction([
      this.prisma.application.update({
        where: { id: application.id },
        data: {
          status: toStep.applicationStatus,
          currentWorkflowStepId: toWorkflowStep?.id ?? null,
        },
      }),
      this.prisma.applicationStatusHistory.create({
        data: {
          applicationId: application.id,
          fromStatus: application.status,
          toStatus: toStep.applicationStatus,
          actionKey: resumeTransition.actionKey,
          comment: 'Citizen submitted corrections',
        },
      }),
    ]);
  }

  async cancelDraft(applicationId: string, citizenId: string) {
    const application = await this.findOwnedApplication(
      applicationId,
      citizenId,
    );
    this.stateMachine.assertCanCancel(application.status);

    this.stateMachine.assertPreSubmitTransition(
      application.status,
      ApplicationStatus.CANCELLED,
    );

    await this.prisma.$transaction([
      this.prisma.application.update({
        where: { id: applicationId },
        data: { status: ApplicationStatus.CANCELLED },
      }),
      this.prisma.applicationStatusHistory.create({
        data: {
          applicationId,
          fromStatus: application.status,
          toStatus: ApplicationStatus.CANCELLED,
          actionKey: 'CANCEL',
        },
      }),
    ]);

    return { id: applicationId, status: ApplicationStatus.CANCELLED };
  }

  async deleteDocument(
    applicationId: string,
    citizenId: string,
    documentId: string,
  ) {
    const application = await this.findOwnedApplication(
      applicationId,
      citizenId,
    );
    this.stateMachine.assertCanModifyDocuments(application.status);

    const document = await this.prisma.applicationDocument.findFirst({
      where: { id: documentId, applicationId },
    });

    if (!document) {
      throw new NotFoundException('Application document not found');
    }

    await this.prisma.applicationDocument.delete({
      where: { id: documentId },
    });

    return this.getById(applicationId, citizenId);
  }

  async getOrCreateCertificate(applicationId: string, citizenId: string) {
    const application = await this.findOwnedApplication(
      applicationId,
      citizenId,
    );

    if (
      application.status !== ApplicationStatus.APPROVED &&
      application.status !== ApplicationStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'Certificate is only available for APPROVED or COMPLETED applications',
      );
    }

    return this.ensureCertificate(application);
  }

  async ensureCertificate(application: {
    id: string;
    publicRef: string | null;
    citizenId: string;
    serviceVersion: {
      overview: { displayName: string } | null;
      subService: { name: string };
    };
  }) {
    const existing = await this.prisma.applicationCertificate.findUnique({
      where: { applicationId: application.id },
    });

    if (existing) {
      return this.formatCertificatePayload(existing);
    }

    const title =
      application.serviceVersion.overview?.displayName ??
      application.serviceVersion.subService.name;
    const ref = application.publicRef ?? application.id.slice(0, 8).toUpperCase();
    const certificateNumber = `CS-${ref}`;
    const issuedAt = new Date();
    const storageKey = `certificates/${application.citizenId}/${application.id}.txt`;
    const stubContent = [
      'CYBERSAVE DIGITAL SERVICES — CERTIFICATE',
      `Title: ${title}`,
      `Certificate Number: ${certificateNumber}`,
      `Issued At: ${issuedAt.toISOString()}`,
      `Application Ref: ${ref}`,
    ].join('\n');

    await this.localStorageProvider.saveUploadedFile(
      storageKey,
      Buffer.from(stubContent, 'utf8'),
      64 * 1024,
    );

    const certificate = await this.prisma.applicationCertificate.create({
      data: {
        applicationId: application.id,
        certificateNumber,
        issuedAt,
        title,
        pdfStorageKey: storageKey,
      },
    });

    return this.formatCertificatePayload(certificate);
  }

  private async formatCertificatePayload(certificate: {
    id: string;
    applicationId: string;
    certificateNumber: string;
    issuedAt: Date;
    title: string;
    pdfStorageKey: string | null;
    createdAt: Date;
  }) {
    let downloadUrl: string | null = null;
    if (certificate.pdfStorageKey) {
      try {
        const download = await this.storageService.requestDownloadUrl({
          storageKey: certificate.pdfStorageKey,
        });
        downloadUrl = download.downloadUrl;
      } catch {
        downloadUrl = null;
      }
    }

    return {
      id: certificate.id,
      applicationId: certificate.applicationId,
      certificateNumber: certificate.certificateNumber,
      issuedAt: certificate.issuedAt,
      title: certificate.title,
      pdfStorageKey: certificate.pdfStorageKey,
      downloadUrl,
      createdAt: certificate.createdAt,
    };
  }

  private async ensurePaymentVerified(
    applicationId: string,
    status: ApplicationStatus,
  ) {
    const skipVerification =
      process.env.SKIP_PAYMENT_VERIFICATION === 'true';

    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        payment: true,
        serviceVersion: {
          include: {
            pricingConfig: { include: { additionalCharges: true } },
            fulfillmentConfig: { include: { stateVariants: true } },
          },
        },
      },
    });

    const totalAmount =
      application?.serviceVersion.pricingConfig &&
      application.serviceVersion.fulfillmentConfig
        ? calculateAssistedTotalAmount(
            application.serviceVersion.pricingConfig,
            application.serviceVersion.fulfillmentConfig,
            application.applicantStateCode,
          )
        : 0;

    if (totalAmount <= 0 || skipVerification) {
      return;
    }

    if (status !== ApplicationStatus.PAYMENT_PENDING) {
      throw new BadRequestException(
        'Application must reach PAYMENT_PENDING before submit',
      );
    }

    const payment = application?.payment;
    if (!payment || payment.status !== PaymentStatus.CAPTURED) {
      throw new BadRequestException(
        'Payment must be captured before submitting the application',
      );
    }
  }

  async getDocumentDownloadUrl(
    applicationId: string,
    documentId: string,
    citizenId: string,
  ) {
    const application = await this.findOwnedApplication(applicationId, citizenId);
    const document = application.documents.find((doc) => doc.id === documentId);

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!document.storedFile?.storageKey) {
      throw new BadRequestException('No file attached to this document');
    }

    return this.storageService.requestDownloadUrl({
      storageKey: document.storedFile.storageKey,
      fileName: document.storedFile.originalFileName ?? undefined,
      mimeType: document.storedFile.mimeType ?? undefined,
    });
  }

  private async findOwnedApplication(applicationId: string, citizenId: string) {
    const application = await this.prisma.application.findFirst({
      where: { id: applicationId, citizenId },
      include: this.citizenDetailInclude(),
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  private citizenDetailInclude() {
    return {
      fieldValues: true,
      documents: {
        include: {
          documentRequirement: true,
          storedFile: true,
        },
      },
      actionRequests: {
        where: { status: 'OPEN' as const },
        orderBy: { createdAt: 'desc' as const },
      },
      payment: true,
      configSnapshot: true,
      pricingSnapshot: true,
      statusHistory: { orderBy: { createdAt: 'asc' as const } },
      serviceVersion: {
        include: {
          overview: true,
          subService: { include: { mainService: true } },
        },
      },
      currentWorkflowStep: true,
    };
  }

  private calculateTotalFromBundle(
    bundle: Awaited<
      ReturnType<ServiceVersionsBundleService['getFullBundle']>
    >,
    stateCode?: string | null,
  ): number {
    return calculateAssistedTotalAmount(
      bundle.pricingConfig,
      bundle.fulfillmentConfig,
      stateCode,
    );
  }

  private calculateTotalFromPricing(pricing: {
    baseFee: { toString(): string };
    taxEnabled: boolean;
    taxRate: { toString(): string };
    additionalCharges: Array<{ amount: { toString(): string } }>;
  }): number {
    const baseFee = Number(pricing.baseFee);
    const taxRate = Number(pricing.taxRate);
    const taxAmount = pricing.taxEnabled ? (baseFee * taxRate) / 100 : 0;
    const additionalTotal = pricing.additionalCharges.reduce(
      (sum, charge) => sum + Number(charge.amount),
      0,
    );
    return baseFee + taxAmount + additionalTotal;
  }

  private formatPaymentIntent(payment: {
    id: string;
    amount: { toString(): string };
    currency: string;
    status: PaymentStatus;
    provider: string;
    providerRef: string | null;
    idempotencyKey: string;
  }) {
    return {
      paymentId: payment.id,
      amount: payment.amount.toString(),
      currency: payment.currency,
      status: payment.status,
      provider: payment.provider,
      providerRef: payment.providerRef,
      idempotencyKey: payment.idempotencyKey,
      clientSecret: payment.providerRef ?? `stub_${payment.id}_${randomUUID()}`,
    };
  }

  private async generateUniquePublicRef(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt++) {
      const publicRef = generateApplicationPublicRef();
      const existing = await this.prisma.application.findUnique({
        where: { publicRef },
      });
      if (!existing) {
        return publicRef;
      }
    }
    throw new ConflictException('Unable to generate unique application reference');
  }
}
