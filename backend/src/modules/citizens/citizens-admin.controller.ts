import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { PERMISSIONS } from '@/common/constants/permissions.constants';
import { AuthType, RequirePermissions } from '@/common/decorators/auth.decorators';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';
import { CitizensAdminService } from './citizens-admin.service';

@ApiTags('Admin Citizens')
@ApiBearerAuth('admin-auth')
@Controller('admin/citizens')
@AuthType('admin')
export class CitizensAdminController {
  constructor(private readonly service: CitizensAdminService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.USER_VIEW)
  list(@Query() query: PaginationQueryDto, @Query('search') search?: string) {
    return this.service.list(query, search);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.USER_VIEW)
  get(@Param('id') id: string) {
    return this.service.getById(id);
  }
}
