import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { PERMISSIONS } from '@/common/constants/permissions.constants';
import {
  AuthType,
  CurrentUser,
  RequirePermissions,
} from '@/common/decorators/auth.decorators';
import type { AuthenticatedAdmin } from '@/common/decorators/auth.decorators';
import { SaveDocumentRequirementsDto } from '../dto/save-document-requirements.dto';
import { SaveFormDto } from '../dto/save-form.dto';
import { SaveFulfillmentDto } from '../dto/save-fulfillment.dto';
import { SavePricingDto } from '../dto/save-pricing.dto';
import { SaveWorkflowDto } from '../dto/save-workflow.dto';
import { UpdateServiceOverviewDto } from '../dto/update-service-overview.dto';
import { ServiceVersionsService } from '../services/service-versions.service';
import {
  ServiceVersionsPublishService,
  ServiceVersionsWizardService,
} from '../services/service-versions-wizard.service';

@ApiTags('Admin Service Versions')
@ApiBearerAuth('admin-auth')
@Controller('admin/service-versions')
@AuthType('admin')
export class ServiceVersionsController {
  constructor(
    private readonly serviceVersionsService: ServiceVersionsService,
    private readonly wizardService: ServiceVersionsWizardService,
    private readonly publishService: ServiceVersionsPublishService,
  ) {}

  @Get(':id')
  @RequirePermissions(PERMISSIONS.SERVICE_UPDATE)
  @ApiOperation({ summary: 'Get full service version bundle for wizard' })
  getById(@Param('id') id: string) {
    return this.serviceVersionsService.getById(id);
  }

  @Put(':id/overview')
  @RequirePermissions(PERMISSIONS.SERVICE_UPDATE)
  @ApiOperation({ summary: 'Save wizard overview step' })
  updateOverview(
    @Param('id') id: string,
    @Body() dto: UpdateServiceOverviewDto,
  ) {
    return this.serviceVersionsService.updateOverview(id, dto);
  }

  @Put(':id/form')
  @RequirePermissions(PERMISSIONS.FORM_UPDATE)
  @ApiOperation({ summary: 'Save form builder configuration' })
  saveForm(@Param('id') id: string, @Body() dto: SaveFormDto) {
    return this.wizardService.saveForm(id, dto);
  }

  @Put(':id/documents')
  @RequirePermissions(PERMISSIONS.SERVICE_UPDATE)
  @ApiOperation({ summary: 'Save document requirements' })
  saveDocuments(
    @Param('id') id: string,
    @Body() dto: SaveDocumentRequirementsDto,
  ) {
    return this.wizardService.saveDocuments(id, dto);
  }

  @Put(':id/pricing')
  @RequirePermissions(PERMISSIONS.SERVICE_UPDATE)
  @ApiOperation({ summary: 'Save pricing configuration' })
  savePricing(@Param('id') id: string, @Body() dto: SavePricingDto) {
    return this.wizardService.savePricing(id, dto);
  }

  @Put(':id/fulfillment')
  @RequirePermissions(PERMISSIONS.SERVICE_UPDATE)
  @ApiOperation({ summary: 'Save fulfillment paths and state portal configuration' })
  saveFulfillment(@Param('id') id: string, @Body() dto: SaveFulfillmentDto) {
    return this.wizardService.saveFulfillment(id, dto);
  }

  @Put(':id/workflow')
  @RequirePermissions(PERMISSIONS.WORKFLOW_CONFIGURE)
  @ApiOperation({ summary: 'Save workflow steps and transitions' })
  saveWorkflow(@Param('id') id: string, @Body() dto: SaveWorkflowDto) {
    return this.wizardService.saveWorkflow(id, dto);
  }

  @Get(':id/preview')
  @RequirePermissions(PERMISSIONS.SERVICE_UPDATE)
  @ApiOperation({ summary: 'Preview citizen-facing configuration' })
  preview(@Param('id') id: string) {
    return this.serviceVersionsService.preview(id);
  }

  @Post(':id/validate')
  @RequirePermissions(PERMISSIONS.SERVICE_PUBLISH)
  @ApiOperation({ summary: 'Validate service version before publish' })
  validate(@Param('id') id: string) {
    return this.publishService.validate(id);
  }

  @Post(':id/publish')
  @RequirePermissions(PERMISSIONS.SERVICE_PUBLISH)
  @ApiOperation({ summary: 'Publish service version' })
  publish(
    @Param('id') id: string,
    @CurrentUser() admin: AuthenticatedAdmin,
  ) {
    return this.publishService.publish(id, admin.id);
  }

  @Post(':id/unpublish')
  @RequirePermissions(PERMISSIONS.SERVICE_PUBLISH)
  @ApiOperation({ summary: 'Unpublish service version' })
  unpublish(@Param('id') id: string) {
    return this.publishService.unpublish(id);
  }

  @Post(':id/archive')
  @RequirePermissions(PERMISSIONS.SERVICE_ARCHIVE)
  @ApiOperation({ summary: 'Archive draft service version' })
  archive(@Param('id') id: string) {
    return this.publishService.archive(id);
  }
}
