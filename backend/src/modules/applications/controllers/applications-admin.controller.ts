import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { PERMISSIONS } from '@/common/constants/permissions.constants';
import {
  AuthType,
  CurrentUser,
  RequireAnyPermissions,
  RequirePermissions,
} from '@/common/decorators/auth.decorators';
import type { AuthenticatedAdmin } from '@/common/decorators/auth.decorators';
import {
  AddInternalNoteDto,
  AdminListApplicationsQueryDto,
  AssignOperatorDto,
  CreateActionRequiredDto,
  ExecuteTransitionDto,
} from '../dto/admin-application.dto';
import { ApplicationsAdminService } from '../services/applications-admin.service';

@ApiTags('Admin Applications')
@ApiBearerAuth('admin-auth')
@Controller('admin/applications')
@AuthType('admin')
export class ApplicationsAdminController {
  constructor(private readonly applicationsService: ApplicationsAdminService) {}

  @Get()
  @RequireAnyPermissions(
    PERMISSIONS.APPLICATION_VIEW,
    PERMISSIONS.APPLICATION_VIEW_ALL,
  )
  @ApiOperation({ summary: 'List applications with filters' })
  list(
    @CurrentUser() admin: AuthenticatedAdmin,
    @Query() query: AdminListApplicationsQueryDto,
  ) {
    return this.applicationsService.list(query, admin);
  }

  @Get(':id')
  @RequireAnyPermissions(
    PERMISSIONS.APPLICATION_VIEW,
    PERMISSIONS.APPLICATION_VIEW_ALL,
  )
  @ApiOperation({ summary: 'Get application detail with snapshot' })
  getDetail(
    @CurrentUser() admin: AuthenticatedAdmin,
    @Param('id') id: string,
  ) {
    return this.applicationsService.getDetail(id, admin);
  }

  @Get(':id/certificate')
  @RequireAnyPermissions(
    PERMISSIONS.APPLICATION_VIEW,
    PERMISSIONS.APPLICATION_VIEW_ALL,
  )
  @ApiOperation({ summary: 'Get application certificate' })
  getCertificate(
    @CurrentUser() admin: AuthenticatedAdmin,
    @Param('id') id: string,
  ) {
    return this.applicationsService.getCertificate(id, admin);
  }

  @Get(':id/documents/:documentId/download')
  @RequireAnyPermissions(
    PERMISSIONS.APPLICATION_VIEW,
    PERMISSIONS.APPLICATION_VIEW_ALL,
  )
  @ApiOperation({ summary: 'Get download URL for an application document' })
  getDocumentDownload(
    @CurrentUser() admin: AuthenticatedAdmin,
    @Param('id') id: string,
    @Param('documentId') documentId: string,
  ) {
    return this.applicationsService.getDocumentDownloadUrl(id, documentId, admin);
  }

  @Post(':id/assign')
  @RequirePermissions(PERMISSIONS.APPLICATION_ASSIGN)
  @ApiOperation({ summary: 'Assign operator to application' })
  assignOperator(
    @CurrentUser() admin: AuthenticatedAdmin,
    @Param('id') id: string,
    @Body() dto: AssignOperatorDto,
  ) {
    return this.applicationsService.assignOperator(id, dto.operatorId, admin);
  }

  @Get(':id/transitions')
  @RequireAnyPermissions(
    PERMISSIONS.APPLICATION_VIEW,
    PERMISSIONS.APPLICATION_VIEW_ALL,
    PERMISSIONS.APPLICATION_TRANSITION,
  )
  @ApiOperation({ summary: 'Get available workflow transitions' })
  getAvailableTransitions(
    @CurrentUser() admin: AuthenticatedAdmin,
    @Param('id') id: string,
  ) {
    return this.applicationsService.getAvailableTransitions(id, admin);
  }

  @Post(':id/transitions')
  @RequireAnyPermissions(
    PERMISSIONS.APPLICATION_TRANSITION,
    PERMISSIONS.APPLICATION_APPROVE,
    PERMISSIONS.APPLICATION_REJECT,
    PERMISSIONS.APPLICATION_REQUEST_CORRECTION,
  )
  @ApiOperation({ summary: 'Execute a workflow transition' })
  executeTransition(
    @CurrentUser() admin: AuthenticatedAdmin,
    @Param('id') id: string,
    @Body() dto: ExecuteTransitionDto,
  ) {
    return this.applicationsService.executeTransition(id, dto, admin);
  }

  @Post(':id/action-required')
  @RequirePermissions(PERMISSIONS.APPLICATION_REQUEST_CORRECTION)
  @ApiOperation({ summary: 'Request citizen correction' })
  createActionRequired(
    @CurrentUser() admin: AuthenticatedAdmin,
    @Param('id') id: string,
    @Body() dto: CreateActionRequiredDto,
  ) {
    return this.applicationsService.createActionRequired(id, dto, admin);
  }

  @Post(':id/notes')
  @RequireAnyPermissions(
    PERMISSIONS.APPLICATION_VIEW,
    PERMISSIONS.APPLICATION_VIEW_ALL,
  )
  @ApiOperation({ summary: 'Add internal note' })
  addInternalNote(
    @CurrentUser() admin: AuthenticatedAdmin,
    @Param('id') id: string,
    @Body() dto: AddInternalNoteDto,
  ) {
    return this.applicationsService.addInternalNote(id, dto, admin);
  }
}
