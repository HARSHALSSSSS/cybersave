import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { PERMISSIONS } from '@/common/constants/permissions.constants';
import { AuthType, RequirePermissions } from '@/common/decorators/auth.decorators';
import {
  CreateHomeBannerDto,
  ReorderHomeBannersDto,
  UpdateHomeBannerDto,
} from '../dto/home-banner.dto';
import { HomeBannersService } from '../services/home-banners.service';

class AdminListQuery {
  @IsOptional()
  @IsString()
  placement?: string;
}

@ApiTags('Admin Home Banners')
@ApiBearerAuth('admin-auth')
@Controller('admin/home-banners')
@AuthType('admin')
export class HomeBannersAdminController {
  constructor(private readonly homeBannersService: HomeBannersService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.SERVICE_UPDATE)
  @ApiOperation({ summary: 'List all home banners' })
  list(@Query() query: AdminListQuery) {
    return this.homeBannersService.listForAdmin(query.placement);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.SERVICE_UPDATE)
  @ApiOperation({ summary: 'Create a home banner linked to a service' })
  create(@Body() dto: CreateHomeBannerDto) {
    return this.homeBannersService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.SERVICE_UPDATE)
  @ApiOperation({ summary: 'Update a home banner' })
  update(@Param('id') id: string, @Body() dto: UpdateHomeBannerDto) {
    return this.homeBannersService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.SERVICE_UPDATE)
  @ApiOperation({ summary: 'Delete a home banner' })
  delete(@Param('id') id: string) {
    return this.homeBannersService.delete(id);
  }

  @Post('reorder')
  @RequirePermissions(PERMISSIONS.SERVICE_UPDATE)
  @ApiOperation({ summary: 'Reorder home banners' })
  reorder(@Body() dto: ReorderHomeBannersDto) {
    return this.homeBannersService.reorder(dto);
  }
}
