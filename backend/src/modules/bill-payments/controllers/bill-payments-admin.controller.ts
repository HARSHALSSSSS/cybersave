import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

import { PERMISSIONS } from '@/common/constants/permissions.constants';
import {
  AuthType,
  RequirePermissions,
} from '@/common/decorators/auth.decorators';
import { BillPaymentsAdminService } from '../services/bill-payments-admin.service';

class UpdateCategoryDto {
  @IsOptional() @IsString() displayName?: string;
  @IsOptional() @IsString() icon?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() appStatus?: string;
  @IsOptional() @IsNumber() displayOrder?: number;
  @IsOptional() @IsBoolean() isFeatured?: boolean;
}

class UpdateBillerDto {
  @IsOptional() @IsBoolean() isVisible?: boolean;
  @IsOptional() @IsBoolean() isFeatured?: boolean;
  @IsOptional() @IsNumber() displayOrder?: number;
  @IsOptional() @IsString() internalAlias?: string;
  @IsOptional() @IsString() internalDescription?: string;
}

@ApiTags('Admin Bill Payments')
@ApiBearerAuth('admin-auth')
@Controller('admin/bill-payments')
@AuthType('admin')
export class BillPaymentsAdminController {
  constructor(private readonly adminService: BillPaymentsAdminService) {}

  @Get('dashboard')
  @RequirePermissions(PERMISSIONS.PAYMENT_VIEW)
  @ApiOperation({ summary: 'Bill payments dashboard stats' })
  dashboard() {
    return this.adminService.getDashboard();
  }

  @Get('categories')
  @RequirePermissions(PERMISSIONS.PAYMENT_VIEW)
  listCategories() {
    return this.adminService.listCategories();
  }

  @Patch('categories/:id')
  @RequirePermissions(PERMISSIONS.PAYMENT_VIEW)
  updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.adminService.updateCategory(id, dto);
  }

  @Get('billers')
  @RequirePermissions(PERMISSIONS.PAYMENT_VIEW)
  listBillers(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.listBillers({
      category,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }

  @Get('billers/:id')
  @RequirePermissions(PERMISSIONS.PAYMENT_VIEW)
  getBiller(@Param('id') id: string) {
    return this.adminService.getBiller(id);
  }

  @Patch('billers/:id')
  @RequirePermissions(PERMISSIONS.PAYMENT_VIEW)
  updateBiller(@Param('id') id: string, @Body() dto: UpdateBillerDto) {
    return this.adminService.updateBiller(id, dto);
  }

  @Get('transactions')
  @RequirePermissions(PERMISSIONS.PAYMENT_VIEW)
  listTransactions(
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('billerId') billerId?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.listTransactions({
      status,
      category,
      billerId,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }

  @Get('transactions/:id')
  @RequirePermissions(PERMISSIONS.PAYMENT_VIEW)
  getTransaction(@Param('id') id: string) {
    return this.adminService.getTransaction(id);
  }

  @Get('integration/status')
  @RequirePermissions(PERMISSIONS.PAYMENT_VIEW)
  integrationStatus() {
    return this.adminService.getIntegrationStatus();
  }

  @Get('integration/logs')
  @RequirePermissions(PERMISSIONS.PAYMENT_VIEW)
  integrationLogs(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.listIntegrationLogs(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Post('sync')
  @RequirePermissions(PERMISSIONS.PAYMENT_VIEW)
  @ApiOperation({ summary: 'Trigger biller catalogue sync' })
  sync() {
    return this.adminService.triggerSync();
  }
}
