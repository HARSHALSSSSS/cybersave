import { Controller, Get, Headers, NotFoundException, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { INDIAN_STATES } from '@/common/constants/indian-states.constants';
import { normalizeLocale } from '@/common/utils/locale.util';
import { AuthType, Public } from '@/common/decorators/auth.decorators';
import { ServicesCatalogService } from '../services/service-versions.service';

@ApiTags('Services Catalogue')
@Controller('services')
@AuthType('citizen')
export class ServicesCatalogController {
  constructor(private readonly catalogService: ServicesCatalogService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List published main services and sub-services' })
  list(@Headers('accept-language') acceptLanguage?: string) {
    return this.catalogService.listPublishedCatalogue(
      normalizeLocale(acceptLanguage),
    );
  }

  @Public()
  @Get('states')
  @ApiOperation({ summary: 'List Indian states and UTs for service selection' })
  listStates() {
    return INDIAN_STATES;
  }

  @Public()
  @Get('sub/:subServiceId/configuration')
  @ApiOperation({ summary: 'Get published service configuration for mobile' })
  async getConfiguration(
    @Param('subServiceId') subServiceId: string,
    @Query('state') state?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const config = await this.catalogService.getPublishedConfiguration(
      subServiceId,
      state?.toUpperCase(),
      normalizeLocale(acceptLanguage),
    );
    if (!config) {
      throw new NotFoundException('Published service configuration not found');
    }
    return config;
  }
}
