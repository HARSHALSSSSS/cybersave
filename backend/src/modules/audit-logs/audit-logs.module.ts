import { Global, Module } from '@nestjs/common';

import { AuditLogsController } from './audit-logs.controller';
import { AuditLogService } from './audit-log.service';

@Global()
@Module({
  controllers: [AuditLogsController],
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class AuditLogsModule {}
