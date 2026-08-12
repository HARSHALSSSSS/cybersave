import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { PERMISSIONS } from '@/common/constants/permissions.constants';
import { AuthType, RequirePermissions } from '@/common/decorators/auth.decorators';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';
import { AdminUsersService } from '../services/admin-users.service';

@ApiTags('Admin Users')
@ApiBearerAuth('admin-auth')
@Controller('admin/admin-users')
@AuthType('admin')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.ADMIN_MANAGE)
  @ApiOperation({ summary: 'List admin users and operators' })
  list(@Query() query: PaginationQueryDto) {
    return this.adminUsersService.list(query);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.ADMIN_MANAGE)
  @ApiOperation({ summary: 'Get admin user / operator by id' })
  getById(@Param('id') id: string) {
    return this.adminUsersService.getById(id);
  }
}
