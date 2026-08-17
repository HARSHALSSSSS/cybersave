import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { PERMISSIONS } from '@/common/constants/permissions.constants';
import { AuthType, RequirePermissions } from '@/common/decorators/auth.decorators';
import {
  CreateGovernmentSchemeDto,
  UpdateGovernmentSchemeDto,
} from '../dto/government-scheme.dto';
import { GovernmentSchemesService } from '../services/government-schemes.service';

@ApiTags('Admin Government Schemes')
@ApiBearerAuth('admin-auth')
@Controller('admin/schemes')
@AuthType('admin')
export class GovernmentSchemesAdminController {
  constructor(private readonly governmentSchemesService: GovernmentSchemesService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.SERVICE_UPDATE)
  @ApiOperation({ summary: 'List all government schemes' })
  list() {
    return this.governmentSchemesService.listAdmin();
  }

  @Post()
  @RequirePermissions(PERMISSIONS.SERVICE_UPDATE)
  @ApiOperation({ summary: 'Create a government scheme for web and mobile' })
  create(@Body() dto: CreateGovernmentSchemeDto) {
    return this.governmentSchemesService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.SERVICE_UPDATE)
  @ApiOperation({ summary: 'Update a government scheme' })
  update(@Param('id') id: string, @Body() dto: UpdateGovernmentSchemeDto) {
    return this.governmentSchemesService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.SERVICE_UPDATE)
  @ApiOperation({ summary: 'Delete a government scheme' })
  delete(@Param('id') id: string) {
    return this.governmentSchemesService.delete(id);
  }
}
