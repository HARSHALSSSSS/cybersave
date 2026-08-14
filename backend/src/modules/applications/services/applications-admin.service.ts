import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ActionRequestStatus,
  ApplicationStatus,
  Prisma,
} from '@prisma/client';

import {
  findSnapshotStepByKey,
  findSnapshotStepByStatus,
} from '@/common/constants/application-state-machine';
import { PERMISSIONS } from '@/common/constants/permissions.constants';
import type { AuthenticatedAdmin } from '@/common/decorators/auth.decorators';
import {
  paginate,
  paginationMeta,
} from '@/common/dto/pagination.dto';
import { PrismaService } from '@/database/database.module';
import { StorageService } from '@/integrations/storage/storage.service';
import { AuditLogService } from '@/modules/audit-logs/audit-log.service';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import {
  AddInternalNoteDto,
  AdminListApplicationsQueryDto,
  CreateActionRequiredDto,
  ExecuteTransitionDto,
} from '../dto/admin-application.dto';
import { ApplicationSnapshotService } from './application-snapshot.service';
import { ApplicationStateMachineService } from './application-state-machine.service';
import { ApplicationsCitizenService } from './applications-citizen.service';

const ALWAYS_NOTIFY_ACTION_KEYS = new Set([
  'APPROVE',
  'REJECT',
  'REQUEST_CORRECTION',
  'COMPLETE',
]);

@Injectable()
export class ApplicationsAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly snapshotService: ApplicationSnapshotService,
    private readonly stateMachine: ApplicationStateMachineService,
    private readonly auditLogService: AuditLogService,
    private readonly notificationsService: NotificationsService,
    private readonly applicationsCitizenService: ApplicationsCitizenService,
    private readonly storageService: StorageService,
  ) {}

  async list(query: AdminListApplicationsQueryDto, admin: AuthenticatedAdmin) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);
    const canViewAll = admin.permissions.includes(
      PERMISSIONS.APPLICATION_VIEW_ALL,
    );

    const where: Prisma.ApplicationWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.assignedOperatorId
        ? { assignedOperatorId: query.assignedOperatorId }
        : {}),
      ...(query.serviceVersionId
        ? { serviceVersionId: query.serviceVersionId }
        : {}),
      ...(query.citizenId ? { citizenId: query.citizenId } : {}),
      ...(query.submittedFrom || query.submittedTo
        ? {
            submittedAt: {
              ...(query.submittedFrom ? { gte: query.submittedFrom } : {}),
              ...(query.submittedTo ? { lte: query.submittedTo } : {}),
            },
          }
        : {}),
      ...(query.search
        ? {
            OR: [
              { publicRef: { contains: query.search, mode: 'insensitive' } },
              {
                citizen: {
                  phone: { contains: query.search, mode: 'insensitive' },
                },
              },
              {
                citizen: {
                  email: {
                    contains: query.search,
                    mode: 'insensitive',
                  },
                },
              },
            ],
          }
        : {}),
      ...(!canViewAll
        ? {
            OR: [
              { assignedOperatorId: admin.id },
              { assignedOperatorId: null },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        include: {
          citizen: {
            select: {
              id: true,
              phone: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          serviceVersion: {
            include: {
              overview: true,
              subService: { include: { mainService: true } },
            },
          },
          assignedOperator: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
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

  async getDetail(applicationId: string, admin: AuthenticatedAdmin) {
    const application = await this.findAccessibleApplication(
      applicationId,
      admin,
    );

    return application;
  }

  async getCertificate(applicationId: string, admin: AuthenticatedAdmin) {
    const application = await this.findAccessibleApplication(
      applicationId,
      admin,
    );

    if (
      application.status !== ApplicationStatus.APPROVED &&
      application.status !== ApplicationStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'Certificate is only available for APPROVED or COMPLETED applications',
      );
    }

    return this.applicationsCitizenService.ensureCertificate(application);
  }

  async getDocumentDownloadUrl(
    applicationId: string,
    documentId: string,
    admin: AuthenticatedAdmin,
  ) {
    const application = await this.findAccessibleApplication(
      applicationId,
      admin,
    );

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

  async assignOperator(
    applicationId: string,
    operatorId: string,
    admin: AuthenticatedAdmin,
  ) {
    if (!admin.permissions.includes(PERMISSIONS.APPLICATION_ASSIGN)) {
      throw new ForbiddenException('Missing application:assign permission');
    }

    const operator = await this.prisma.adminUser.findUnique({
      where: { id: operatorId },
    });

    if (!operator) {
      throw new NotFoundException('Operator not found');
    }

    await this.findAccessibleApplication(applicationId, admin);

    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: { assignedOperatorId: operatorId },
      include: this.adminDetailInclude(),
    });

    await this.auditLogService.log(
      admin.id,
      'APPLICATION_ASSIGNED',
      'application',
      applicationId,
      { operatorId },
    );

    return updated;
  }

  async getAvailableTransitions(
    applicationId: string,
    admin: AuthenticatedAdmin,
  ) {
    const application = await this.findAccessibleApplication(
      applicationId,
      admin,
    );

    if (!application.configSnapshot) {
      return { transitions: [] };
    }

    const workflow = this.snapshotService.getWorkflowFromSnapshot(
      application.configSnapshot,
    );

    if (!workflow || !application.currentWorkflowStep) {
      return { transitions: [] };
    }

    const transitions = this.stateMachine.filterAvailableTransitions(
      workflow,
      application.currentWorkflowStep.stepKey,
      { admin },
    );

    return {
      currentStep: application.currentWorkflowStep,
      transitions: transitions.map((t) => ({
        actionKey: t.actionKey,
        label: t.label,
        toStepKey: t.toStepKey,
        toApplicationStatus: t.toApplicationStatus,
        requiresComment: t.requiresComment,
        requiresAssignment: t.requiresAssignment,
        createsActionRequest: t.createsActionRequest,
      })),
    };
  }

  async executeTransition(
    applicationId: string,
    dto: ExecuteTransitionDto,
    admin: AuthenticatedAdmin,
  ) {
    const application = await this.findAccessibleApplication(
      applicationId,
      admin,
    );

    if (!application.configSnapshot || !application.currentWorkflowStep) {
      throw new BadRequestException(
        'Application workflow snapshot is not available',
      );
    }

    const workflow = this.snapshotService.getWorkflowFromSnapshot(
      application.configSnapshot,
    );

    if (!workflow) {
      throw new BadRequestException('Workflow snapshot is invalid');
    }

    const transition = this.stateMachine.resolvePostSubmitTransition(
      workflow,
      application.currentWorkflowStep.stepKey,
      dto.actionKey,
      { admin },
      {
        comment: dto.comment,
        assignedOperatorId: application.assignedOperatorId,
      },
    );

    const toStep = findSnapshotStepByKey(workflow, transition.toStepKey);
    if (!toStep) {
      throw new BadRequestException('Target workflow step not found in snapshot');
    }

    const toWorkflowStep = await this.prisma.workflowStep.findFirst({
      where: {
        workflowDefinitionId: application.workflowDefinitionId,
        stepKey: toStep.stepKey,
      },
    });

    await this.prisma.$transaction(async (tx) => {
      await tx.application.update({
        where: { id: applicationId },
        data: {
          status: toStep.applicationStatus,
          currentWorkflowStepId: toWorkflowStep?.id ?? null,
        },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId,
          fromStatus: application.status,
          toStatus: toStep.applicationStatus,
          actionKey: dto.actionKey,
          actorAdminId: admin.id,
          comment: dto.comment,
        },
      });

      if (transition.createsActionRequest) {
        await tx.applicationActionRequest.create({
          data: {
            applicationId,
            reason: dto.comment?.trim() || transition.label,
            instructions: dto.instructions ?? dto.comment,
            requiredDocumentIds: dto.requiredDocumentIds ?? [],
            requiredFieldKeys: dto.requiredFieldKeys ?? [],
            deadline: dto.deadline ?? this.defaultCorrectionDeadline(),
            status: ActionRequestStatus.OPEN,
          },
        });
      }
    });

    await this.auditLogService.log(
      admin.id,
      'APPLICATION_TRANSITION',
      'application',
      applicationId,
      {
        actionKey: dto.actionKey,
        fromStatus: application.status,
        toStatus: toStep.applicationStatus,
      },
    );

    if (this.shouldNotifyCitizen(transition.notifyCitizen, dto.actionKey)) {
      await this.notifyCitizenOfStatusChange(
        application,
        toStep.applicationStatus,
        {
          comment: dto.comment,
          instructions: dto.instructions,
          deadline: dto.deadline ?? (transition.createsActionRequest
            ? this.defaultCorrectionDeadline()
            : undefined),
        },
      );
    }

    return this.getDetail(applicationId, admin);
  }

  async createActionRequired(
    applicationId: string,
    dto: CreateActionRequiredDto,
    admin: AuthenticatedAdmin,
  ) {
    if (
      !admin.permissions.includes(PERMISSIONS.APPLICATION_REQUEST_CORRECTION)
    ) {
      throw new ForbiddenException(
        'Missing application:request_correction permission',
      );
    }

    const application = await this.findAccessibleApplication(
      applicationId,
      admin,
    );

    const workflow = application.configSnapshot
      ? this.snapshotService.getWorkflowFromSnapshot(application.configSnapshot)
      : null;

    const correctionTransition = workflow?.transitions.find(
      (t) =>
        t.createsActionRequest &&
        t.fromStepKey === application.currentWorkflowStep?.stepKey,
    );

    if (correctionTransition) {
      const updatedApplication = await this.executeTransition(
        applicationId,
        {
          actionKey: correctionTransition.actionKey,
          comment: dto.reason,
          instructions: dto.instructions,
          requiredFieldKeys: dto.requiredFieldKeys,
          requiredDocumentIds: dto.requiredDocumentIds,
          deadline: dto.deadline,
        },
        admin,
      );

      const actionRequest = await this.prisma.applicationActionRequest.findFirst(
        {
          where: {
            applicationId,
            status: ActionRequestStatus.OPEN,
          },
          orderBy: { createdAt: 'desc' },
        },
      );

      return {
        actionRequest,
        application: updatedApplication,
      };
    }

    const actionRequest = await this.prisma.applicationActionRequest.create({
      data: {
        applicationId,
        reason: dto.reason,
        instructions: dto.instructions,
        requiredDocumentIds: dto.requiredDocumentIds ?? [],
        requiredFieldKeys: dto.requiredFieldKeys ?? [],
        deadline: dto.deadline ?? this.defaultCorrectionDeadline(),
        status: ActionRequestStatus.OPEN,
      },
    });

    const actionRequiredStep = workflow
      ? findSnapshotStepByStatus(workflow, ApplicationStatus.ACTION_REQUIRED)
      : null;

    const workflowStep = actionRequiredStep
      ? await this.prisma.workflowStep.findFirst({
          where: {
            workflowDefinitionId: application.workflowDefinitionId,
            stepKey: actionRequiredStep.stepKey,
          },
        })
      : null;

    await this.prisma.$transaction([
      this.prisma.application.update({
        where: { id: applicationId },
        data: {
          status: ApplicationStatus.ACTION_REQUIRED,
          currentWorkflowStepId:
            workflowStep?.id ?? application.currentWorkflowStepId,
        },
      }),
      this.prisma.applicationStatusHistory.create({
        data: {
          applicationId,
          fromStatus: application.status,
          toStatus: ApplicationStatus.ACTION_REQUIRED,
          actionKey: 'REQUEST_CORRECTION',
          actorAdminId: admin.id,
          comment: dto.reason,
        },
      }),
    ]);

    await this.notifyCitizenOfStatusChange(
      application,
      ApplicationStatus.ACTION_REQUIRED,
      {
        comment: dto.reason,
        instructions: dto.instructions,
        deadline: dto.deadline ?? this.defaultCorrectionDeadline(),
      },
    );

    return {
      actionRequest,
      application: await this.getDetail(applicationId, admin),
    };
  }

  async addInternalNote(
    applicationId: string,
    dto: AddInternalNoteDto,
    admin: AuthenticatedAdmin,
  ) {
    await this.findAccessibleApplication(applicationId, admin);

    const note = await this.prisma.applicationInternalNote.create({
      data: {
        applicationId,
        authorAdminId: admin.id,
        content: dto.content,
      },
      include: {
        authorAdmin: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return note;
  }

  private shouldNotifyCitizen(
    notifyCitizenFlag: boolean,
    actionKey: string,
  ): boolean {
    return notifyCitizenFlag || ALWAYS_NOTIFY_ACTION_KEYS.has(actionKey);
  }

  private defaultCorrectionDeadline(days = 7) {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + days);
    deadline.setHours(23, 59, 59, 999);
    return deadline;
  }

  private async notifyCitizenOfStatusChange(
    application: {
      id: string;
      citizenId: string;
      publicRef?: string | null;
    },
    newStatus: ApplicationStatus,
    options?: {
      comment?: string;
      instructions?: string;
      deadline?: Date | string | null;
    },
  ) {
    const ref = application.publicRef ?? application.id;
    const statusLabel = newStatus.replace(/_/g, ' ').toLowerCase();
    const comment = options?.comment?.trim();
    const instructions = options?.instructions?.trim();
    const deadline =
      options?.deadline != null ? new Date(options.deadline) : null;
    const deadlineText =
      deadline && !Number.isNaN(deadline.getTime())
        ? deadline.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : null;

    let title = `Application ${statusLabel}`;
    let body = `Your application ${ref} status is now ${statusLabel}.`;

    if (newStatus === ApplicationStatus.ACTION_REQUIRED) {
      title = `Action needed on application ${ref}`;
      body = `Please update your application on the Cybersave website or mobile app`;
      if (deadlineText) {
        body += ` by ${deadlineText}`;
      }
      body += '.';
      if (instructions || comment) {
        body += ` ${instructions || comment}`;
      }
    } else if (newStatus === ApplicationStatus.APPROVED) {
      title = `Application ${ref} approved`;
      body = `Good news — application ${ref} has been approved.`;
      if (comment) body += ` ${comment}`;
    } else if (newStatus === ApplicationStatus.COMPLETED) {
      title = `Application ${ref} completed`;
      body = `Application ${ref} is complete. You can download your certificate from Cybersave.`;
    } else if (newStatus === ApplicationStatus.REJECTED) {
      title = `Application ${ref} rejected`;
      body = `Application ${ref} was rejected.`;
      if (comment) body += ` Reason: ${comment}`;
    } else if (comment) {
      body += ` ${comment}`;
    }

    await this.notificationsService.create({
      citizenId: application.citizenId,
      title,
      body,
      metadata: {
        applicationId: application.id,
        publicRef: application.publicRef,
        status: newStatus,
        deadline: deadline?.toISOString() ?? null,
        type: 'application',
      },
    });
  }

  private async findAccessibleApplication(
    applicationId: string,
    admin: AuthenticatedAdmin,
  ) {
    const application = await this.prisma.application.findFirst({
      where: {
        OR: [{ id: applicationId }, { publicRef: applicationId }],
      },
      include: this.adminDetailInclude(),
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const canViewAll = admin.permissions.includes(
      PERMISSIONS.APPLICATION_VIEW_ALL,
    );
    const canView =
      canViewAll ||
      admin.permissions.includes(PERMISSIONS.APPLICATION_VIEW);

    if (!canView) {
      throw new ForbiddenException('Missing application view permission');
    }

    if (
      !canViewAll &&
      application.assignedOperatorId &&
      application.assignedOperatorId !== admin.id
    ) {
      throw new ForbiddenException(
        'Application is assigned to another operator',
      );
    }

    return application;
  }

  private adminDetailInclude() {
    return {
      citizen: true,
      fieldValues: true,
      documents: {
        include: { documentRequirement: true, storedFile: true },
      },
      configSnapshot: true,
      pricingSnapshot: true,
      payment: true,
      statusHistory: {
        orderBy: { createdAt: 'asc' as const },
        include: {
          actorAdmin: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      actionRequests: { orderBy: { createdAt: 'desc' as const } },
      internalNotes: {
        orderBy: { createdAt: 'desc' as const },
        include: {
          authorAdmin: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      assignedOperator: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      currentWorkflowStep: true,
      serviceVersion: {
        include: {
          overview: true,
          subService: { include: { mainService: true } },
        },
      },
    };
  }
}
