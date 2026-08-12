import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { PERMISSIONS } from '@/common/constants/permissions.constants';
import { AuthType, RequirePermissions } from '@/common/decorators/auth.decorators';
import { ServiceVersionsBundleService } from '@/modules/service-versions/services/service-versions-bundle.service';
import { CreateSubServiceDto } from '../dto/create-sub-service.dto';
import { ReorderSubServicesDto } from '../dto/reorder-sub-services.dto';
import { UpdateSubServiceDto } from '../dto/update-sub-service.dto';
import { SubServicesService } from '../services/sub-services.service';

@ApiTags('Admin Sub Services')
@ApiBearerAuth('admin-auth')
@Controller('admin')
@AuthType('admin')
export class SubServicesController {
  constructor(private readonly subServicesService: SubServicesService) {}

  @Post('main-services/:mainServiceId/sub-services')
  @RequirePermissions(PERMISSIONS.SERVICE_CREATE)
  @ApiOperation({ summary: 'Create sub service with initial draft version' })
  create(
    @Param('mainServiceId') mainServiceId: string,
    @Body() dto: CreateSubServiceDto,
  ) {
    return this.subServicesService.create(mainServiceId, dto);
  }

  @Patch('sub-services/:id')
  @RequirePermissions(PERMISSIONS.SERVICE_UPDATE)
  @ApiOperation({ summary: 'Update sub service' })
  update(@Param('id') id: string, @Body() dto: UpdateSubServiceDto) {
    return this.subServicesService.update(id, dto);
  }

  @Post('main-services/:mainServiceId/sub-services/reorder')
  @RequirePermissions(PERMISSIONS.SERVICE_UPDATE)
  @ApiOperation({ summary: 'Reorder sub services within a main service' })
  reorder(
    @Param('mainServiceId') mainServiceId: string,
    @Body() dto: ReorderSubServicesDto,
  ) {
    return this.subServicesService.reorder(mainServiceId, dto);
  }

  @Post('sub-services/:id/archive')
  @RequirePermissions(PERMISSIONS.SERVICE_ARCHIVE)
  @ApiOperation({ summary: 'Archive sub service' })
  archive(@Param('id') id: string) {
    return this.subServicesService.archive(id);
  }
}

@ApiTags('Admin Sub Service Versions')
@ApiBearerAuth('admin-auth')
@Controller('admin/sub-services/:subServiceId')
@AuthType('admin')
export class SubServiceVersionsController {
  constructor(private readonly bundleService: ServiceVersionsBundleService) {}

  @Post('versions')
  @RequirePermissions(PERMISSIONS.SERVICE_CREATE)
  @ApiOperation({
    summary: 'Create new draft service version (clone from latest published)',
  })
  createVersion(
    @Param('subServiceId') subServiceId: string,
    @Body() body: { cloneFromVersionId?: string },
  ) {
    return this.bundleService.cloneDraftVersion(
      subServiceId,
      body?.cloneFromVersionId,
    );
  }
}
