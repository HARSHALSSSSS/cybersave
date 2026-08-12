import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { PERMISSIONS } from '@/common/constants/permissions.constants';
import { AuthType, RequirePermissions } from '@/common/decorators/auth.decorators';
import { DashboardService } from './dashboard.service';

@ApiTags('Admin Dashboard')
@ApiBearerAuth('admin-auth')
@Controller('admin/dashboard')
@AuthType('admin')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @RequirePermissions(PERMISSIONS.REPORTS_VIEW)
  @ApiOperation({ summary: 'Dashboard KPI summary' })
  summary() {
    return this.dashboardService.summary();
  }

  @Get('revenue-trends')
  @RequirePermissions(PERMISSIONS.REPORTS_VIEW)
  @ApiOperation({ summary: 'Daily captured revenue for charts' })
  revenueTrends(@Query('days') days = 7) {
    return this.dashboardService.revenueTrends(Number(days) || 7);
  }

  @Get('application-trends')
  @RequirePermissions(PERMISSIONS.REPORTS_VIEW)
  @ApiOperation({ summary: 'Daily application volume by status group' })
  applicationTrends(@Query('days') days = 7) {
    return this.dashboardService.applicationTrends(Number(days) || 7);
  }

  @Get('service-share')
  @RequirePermissions(PERMISSIONS.REPORTS_VIEW)
  @ApiOperation({ summary: 'Application distribution by service' })
  serviceShare(@Query('limit') limit = 6) {
    return this.dashboardService.serviceShare(Number(limit) || 6);
  }

  @Get('operator-logs')
  @RequirePermissions(PERMISSIONS.REPORTS_VIEW)
  @ApiOperation({ summary: 'Recent operator audit activity' })
  operatorLogs(@Query('limit') limit = 8) {
    return this.dashboardService.operatorLogs(Number(limit) || 8);
  }

  @Get('document-activity')
  @RequirePermissions(PERMISSIONS.REPORTS_VIEW)
  @ApiOperation({ summary: 'Daily document upload counts' })
  documentActivity(@Query('days') days = 7) {
    return this.dashboardService.documentActivityTrends(Number(days) || 7);
  }
}
