import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { PERMISSIONS } from '@/common/constants/permissions.constants';
import { AuthType, RequirePermissions } from '@/common/decorators/auth.decorators';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';
import { CreateMainServiceDto } from '../dto/create-main-service.dto';
import { ReorderMainServicesDto } from '../dto/reorder-main-services.dto';
import { UpdateMainServiceDto } from '../dto/update-main-service.dto';
import { MainServicesService } from '../services/main-services.service';

@ApiTags('Admin Main Services')
@ApiBearerAuth('admin-auth')
@Controller('admin/main-services')
@AuthType('admin')
export class MainServicesController {
  constructor(private readonly mainServicesService: MainServicesService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.SERVICE_UPDATE)
  @ApiOperation({ summary: 'List main services' })
  list(@Query() query: PaginationQueryDto) {
    return this.mainServicesService.list(query);
  }

  @Post('reorder')
  @RequirePermissions(PERMISSIONS.SERVICE_UPDATE)
  @ApiOperation({ summary: 'Reorder main services' })
  reorder(@Body() dto: ReorderMainServicesDto) {
    return this.mainServicesService.reorder(dto);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.SERVICE_UPDATE)
  @ApiOperation({ summary: 'Get main service with sub-services' })
  async getById(@Param('id') id: string) {
    const item = await this.mainServicesService.getById(id);
    if (!item) {
      throw new NotFoundException('Main service not found');
    }
    return item;
  }

  @Post()
  @RequirePermissions(PERMISSIONS.SERVICE_CREATE)
  @ApiOperation({ summary: 'Create main service' })
  create(@Body() dto: CreateMainServiceDto) {
    return this.mainServicesService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.SERVICE_UPDATE)
  @ApiOperation({ summary: 'Update main service' })
  update(@Param('id') id: string, @Body() dto: UpdateMainServiceDto) {
    return this.mainServicesService.update(id, dto);
  }

  @Post(':id/archive')
  @RequirePermissions(PERMISSIONS.SERVICE_ARCHIVE)
  @ApiOperation({ summary: 'Archive main service' })
  archive(@Param('id') id: string) {
    return this.mainServicesService.archive(id);
  }
}
