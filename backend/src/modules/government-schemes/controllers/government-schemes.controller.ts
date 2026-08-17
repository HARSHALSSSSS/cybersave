import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { AuthType, Public } from '@/common/decorators/auth.decorators';
import { GovernmentSchemesService } from '../services/government-schemes.service';

class ListSchemesQuery {
  @IsOptional()
  @IsString()
  category?: string;
}

@ApiTags('Government Schemes')
@Controller('schemes')
@AuthType('citizen')
export class GovernmentSchemesController {
  constructor(private readonly governmentSchemesService: GovernmentSchemesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List active government schemes for web and mobile' })
  list(@Query() query: ListSchemesQuery) {
    return this.governmentSchemesService.listPublic(query.category);
  }

  @Public()
  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get one active government scheme' })
  get(@Param('idOrSlug') idOrSlug: string) {
    return this.governmentSchemesService.getPublic(idOrSlug);
  }
}
