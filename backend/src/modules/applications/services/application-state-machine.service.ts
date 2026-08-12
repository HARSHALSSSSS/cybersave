import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ApplicationStatus } from '@prisma/client';

import {
  canTransitionPreSubmit,
  isPostSubmitStatus,
  isPreSubmitStatus,
  TERMINAL_STATUSES,
  validatePostSubmitTransition,
  type WorkflowSnapshot,
  type WorkflowSnapshotTransition,
} from '@/common/constants/application-state-machine';
import type { AuthenticatedAdmin } from '@/common/decorators/auth.decorators';

export interface TransitionActor {
  admin?: AuthenticatedAdmin;
}

@Injectable()
export class ApplicationStateMachineService {
  assertPreSubmitTransition(
    from: ApplicationStatus,
    to: ApplicationStatus,
  ): void {
    if (!canTransitionPreSubmit(from, to)) {
      throw new BadRequestException(
        `Cannot transition application from ${from} to ${to}`,
      );
    }
  }

  assertCanModifyDraft(status: ApplicationStatus): void {
    if (!isPreSubmitStatus(status)) {
      throw new BadRequestException(
        'Application cannot be modified after submission',
      );
    }
    if (status === ApplicationStatus.CANCELLED) {
      throw new BadRequestException('Application is cancelled');
    }
  }

  /** Draft edits + document re-uploads while ACTION_REQUIRED. */
  assertCanModifyDocuments(status: ApplicationStatus): void {
    if (status === ApplicationStatus.ACTION_REQUIRED) {
      return;
    }
    this.assertCanModifyDraft(status);
  }

  assertCitizenCanSubmit(status: ApplicationStatus): void {
    if (status !== ApplicationStatus.PAYMENT_PENDING) {
      throw new BadRequestException(
        'Application must be in PAYMENT_PENDING status before submit',
      );
    }
  }

  assertCanCancel(status: ApplicationStatus): void {
    if (!isPreSubmitStatus(status)) {
      throw new BadRequestException(
        'Only draft applications can be cancelled',
      );
    }
  }

  assertCanSubmitCorrection(status: ApplicationStatus): void {
    if (status !== ApplicationStatus.ACTION_REQUIRED) {
      throw new BadRequestException(
        'Corrections can only be submitted when action is required',
      );
    }
  }

  resolvePostSubmitTransition(
    snapshot: WorkflowSnapshot,
    currentStepKey: string,
    actionKey: string,
    actor: TransitionActor,
    options?: { comment?: string; assignedOperatorId?: string | null },
  ): WorkflowSnapshotTransition {
    if (!currentStepKey) {
      throw new BadRequestException('Application has no current workflow step');
    }

    const transition = validatePostSubmitTransition(
      snapshot,
      currentStepKey,
      actionKey,
    );

    this.assertActorCanExecute(transition, actor);

    if (transition.requiresComment && !options?.comment?.trim()) {
      throw new BadRequestException('Comment is required for this transition');
    }

    if (
      transition.requiresAssignment &&
      !options?.assignedOperatorId
    ) {
      throw new BadRequestException(
        'Application must be assigned before this transition',
      );
    }

    return transition;
  }

  filterAvailableTransitions(
    snapshot: WorkflowSnapshot,
    currentStepKey: string,
    actor: TransitionActor,
  ): WorkflowSnapshotTransition[] {
    return snapshot.transitions.filter((transition) => {
      if (transition.fromStepKey !== currentStepKey) {
        return false;
      }
      try {
        this.assertActorCanExecute(transition, actor);
        return true;
      } catch {
        return false;
      }
    });
  }

  isTerminalStatus(status: ApplicationStatus): boolean {
    return TERMINAL_STATUSES.has(status);
  }

  requiresPayment(totalAmount: number): boolean {
    return totalAmount > 0;
  }

  suggestNextPreSubmitStatus(
    hasDocumentRequirements: boolean,
    totalAmount: number,
    formComplete: boolean,
    documentsComplete: boolean,
  ): ApplicationStatus | null {
    if (!formComplete) {
      return ApplicationStatus.FORM_IN_PROGRESS;
    }
    if (hasDocumentRequirements && !documentsComplete) {
      return ApplicationStatus.DOCUMENTS_PENDING;
    }
    if (this.requiresPayment(totalAmount)) {
      return ApplicationStatus.PAYMENT_PENDING;
    }
    return ApplicationStatus.PAYMENT_PENDING;
  }

  private assertActorCanExecute(
    transition: WorkflowSnapshotTransition,
    actor: TransitionActor,
  ): void {
    const admin = actor.admin;
    if (!admin) {
      throw new ForbiddenException('Admin authentication required');
    }

    if (transition.requiredPermissions.length > 0) {
      const hasPermission = transition.requiredPermissions.every((permission) =>
        admin.permissions.includes(permission),
      );
      if (!hasPermission) {
        throw new ForbiddenException(
          `Missing permissions: ${transition.requiredPermissions.join(', ')}`,
        );
      }
    }

    if (transition.allowedRoleIds.length > 0) {
      const hasRole = transition.allowedRoleIds.some((roleId) =>
        admin.roles.includes(roleId),
      );
      if (!hasRole) {
        throw new ForbiddenException('Role not allowed for this transition');
      }
    }
  }
}

export { isPostSubmitStatus, isPreSubmitStatus };
