import { Controller, Get, Headers, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { AuthType, Public } from '@/common/decorators/auth.decorators';
import { normalizeLocale } from '@/common/utils/locale.util';
import { HomeBannersService } from '../services/home-banners.service';

class ListBannersQuery {
  @IsOptional()
  @IsString()
  placement?: string;
}

@ApiTags('Home Banners')
@Controller('home/banners')
@AuthType('citizen')
export class HomeBannersController {
  constructor(private readonly homeBannersService: HomeBannersService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List active promotional banners for mobile home' })
  list(
    @Query() query: ListBannersQuery,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    return this.homeBannersService.listForMobile(
      query.placement ?? 'home',
      normalizeLocale(acceptLanguage),
    );
  }
}
