import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

import type { UploadedFilePayload } from '@/common/types/uploaded-file.type';
import {
  AuthType,
  CurrentUser,
} from '@/common/decorators/auth.decorators';
import type { AuthenticatedCitizen } from '@/common/decorators/auth.decorators';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';
import {
  CompleteUploadDto,
  CreateApplicationDto,
  CreatePaymentIntentDto,
  RequestUploadDto,
  SaveFormValuesDto,
  SubmitCorrectionDto,
} from '../dto/citizen-application.dto';
import { ApplicationsCitizenService } from '../services/applications-citizen.service';

@ApiTags('Applications')
@ApiBearerAuth('citizen-auth')
@Controller('applications')
@AuthType('citizen')
export class ApplicationsCitizenController {
  constructor(
    private readonly applicationsService: ApplicationsCitizenService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a draft application for a sub-service' })
  createDraft(
    @CurrentUser() user: AuthenticatedCitizen,
    @Body() dto: CreateApplicationDto,
  ) {
    return this.applicationsService.createDraft(
      dto.subServiceId,
      user.id,
      dto.stateCode,
      dto.stateName,
    );
  }

  @Get('drafts')
  @ApiOperation({ summary: 'List citizen draft applications' })
  listDrafts(@CurrentUser() user: AuthenticatedCitizen) {
    return this.applicationsService.listDrafts(user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List citizen submitted applications' })
  listApplications(
    @CurrentUser() user: AuthenticatedCitizen,
    @Query() query: PaginationQueryDto & { status?: string },
  ) {
    return this.applicationsService.listApplications(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application detail' })
  getById(
    @CurrentUser() user: AuthenticatedCitizen,
    @Param('id') id: string,
  ) {
    return this.applicationsService.getById(id, user.id);
  }

  @Get(':id/certificate')
  @ApiOperation({ summary: 'Get or create certificate for approved application' })
  getCertificate(
    @CurrentUser() user: AuthenticatedCitizen,
    @Param('id') id: string,
  ) {
    return this.applicationsService.getOrCreateCertificate(id, user.id);
  }

  @Patch(':id/form')
  @ApiOperation({ summary: 'Save form field values' })
  saveFormValues(
    @CurrentUser() user: AuthenticatedCitizen,
    @Param('id') id: string,
    @Body() dto: SaveFormValuesDto,
  ) {
    return this.applicationsService.saveFormValues(id, user.id, dto.values);
  }

  @Post(':id/validate')
  @ApiOperation({ summary: 'Validate form and/or documents' })
  validateApplication(
    @CurrentUser() user: AuthenticatedCitizen,
    @Param('id') id: string,
    @Query('scope') scope?: 'form' | 'documents' | 'all',
  ) {
    return this.applicationsService.validateApplication(id, user.id, scope);
  }

  @Post(':id/uploads/request')
  @ApiOperation({ summary: 'Request presigned upload URL for a document' })
  requestUpload(
    @CurrentUser() user: AuthenticatedCitizen,
    @Param('id') id: string,
    @Body() dto: RequestUploadDto,
  ) {
    return this.applicationsService.requestUpload(id, user.id, dto);
  }

  @Post(':id/uploads/:uploadSessionId/file')
  @ApiOperation({ summary: 'Upload file bytes for a pending application upload session' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 15 * 1024 * 1024 } }),
  )
  uploadSessionFile(
    @CurrentUser() user: AuthenticatedCitizen,
    @Param('id') id: string,
    @Param('uploadSessionId') uploadSessionId: string,
    @UploadedFile() file: UploadedFilePayload,
  ) {
    return this.applicationsService.uploadSessionFile(
      id,
      user.id,
      uploadSessionId,
      file,
    );
  }

  @Post(':id/uploads/complete')
  @ApiOperation({ summary: 'Confirm upload and attach document' })
  completeUpload(
    @CurrentUser() user: AuthenticatedCitizen,
    @Param('id') id: string,
    @Body() dto: CompleteUploadDto,
  ) {
    return this.applicationsService.completeUpload(id, user.id, dto);
  }

  @Delete(':id/documents/:documentId')
  @ApiOperation({ summary: 'Remove a draft application document' })
  deleteDocument(
    @CurrentUser() user: AuthenticatedCitizen,
    @Param('id') id: string,
    @Param('documentId') documentId: string,
  ) {
    return this.applicationsService.deleteDocument(id, user.id, documentId);
  }

  @Post(':id/payment-intent')
  @ApiOperation({ summary: 'Create payment intent for application' })
  createPaymentIntent(
    @CurrentUser() user: AuthenticatedCitizen,
    @Param('id') id: string,
    @Body() dto: CreatePaymentIntentDto,
  ) {
    return this.applicationsService.createPaymentIntent(
      id,
      user.id,
      dto.idempotencyKey,
    );
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit application after payment verification' })
  submitApplication(
    @CurrentUser() user: AuthenticatedCitizen,
    @Param('id') id: string,
  ) {
    return this.applicationsService.submitApplication(id, user.id);
  }

  @Post(':id/corrections/submit')
  @ApiOperation({ summary: 'Submit correction for ACTION_REQUIRED' })
  submitCorrection(
    @CurrentUser() user: AuthenticatedCitizen,
    @Param('id') id: string,
    @Body() dto: SubmitCorrectionDto,
  ) {
    return this.applicationsService.submitCorrection(id, user.id, dto.values);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a draft application' })
  cancelDraft(
    @CurrentUser() user: AuthenticatedCitizen,
    @Param('id') id: string,
  ) {
    return this.applicationsService.cancelDraft(id, user.id);
  }
}
