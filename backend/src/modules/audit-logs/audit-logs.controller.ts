import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { PERMISSIONS } from '@/common/constants/permissions.constants';
import { AuthType, RequirePermissions } from '@/common/decorators/auth.decorators';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';
import { AuditLogService } from './audit-log.service';

@ApiTags('Admin Audit Logs')
@ApiBearerAuth('admin-auth')
@Controller('admin/audit-logs')
@AuthType('admin')
export class AuditLogsController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.AUDIT_VIEW)
  list(@Query() query: PaginationQueryDto, @Query('resourceType') resourceType?: string) {
    return this.auditLogService.list(query, resourceType);
  }
}
