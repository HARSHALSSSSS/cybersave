import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { PERMISSIONS } from '@/common/constants/permissions.constants';
import { AuthType, RequireAnyPermissions } from '@/common/decorators/auth.decorators';
import { RolesService } from '../services/roles.service';

@ApiTags('Admin Roles')
@ApiBearerAuth('admin-auth')
@Controller('admin')
@AuthType('admin')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get('roles')
  @RequireAnyPermissions(PERMISSIONS.ROLE_MANAGE, PERMISSIONS.ADMIN_MANAGE)
  @ApiOperation({ summary: 'List roles with permissions' })
  listRoles() {
    return this.rolesService.listRoles();
  }

  @Get('permissions')
  @RequireAnyPermissions(PERMISSIONS.ROLE_MANAGE, PERMISSIONS.ADMIN_MANAGE)
  @ApiOperation({ summary: 'List all permissions' })
  listPermissions() {
    return this.rolesService.listPermissions();
  }
}
