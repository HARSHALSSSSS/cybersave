import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
import { CitizenProfileService } from './citizen-profile.service';
import {
  CompleteProfileUploadDto,
  CreateAddressDto,
  CreateSavedDocumentDto,
  RequestProfileUploadDto,
  UpdateAddressDto,
} from './dto/citizen-profile.dto';

@ApiTags('Citizen Profile')
@ApiBearerAuth('citizen-auth')
@Controller('profile')
@AuthType('citizen')
export class CitizenProfileController {
  constructor(private readonly citizenProfileService: CitizenProfileService) {}

  @Get('addresses')
  @ApiOperation({ summary: 'List saved addresses' })
  listAddresses(@CurrentUser() user: AuthenticatedCitizen) {
    return this.citizenProfileService.listAddresses(user.id);
  }

  @Post('addresses')
  @ApiOperation({ summary: 'Create a saved address' })
  createAddress(
    @CurrentUser() user: AuthenticatedCitizen,
    @Body() dto: CreateAddressDto,
  ) {
    return this.citizenProfileService.createAddress(user.id, dto);
  }

  @Patch('addresses/:id')
  @ApiOperation({ summary: 'Update a saved address' })
  updateAddress(
    @CurrentUser() user: AuthenticatedCitizen,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.citizenProfileService.updateAddress(user.id, id, dto);
  }

  @Delete('addresses/:id')
  @ApiOperation({ summary: 'Delete a saved address' })
  deleteAddress(
    @CurrentUser() user: AuthenticatedCitizen,
    @Param('id') id: string,
  ) {
    return this.citizenProfileService.deleteAddress(user.id, id);
  }

  @Get('documents')
  @ApiOperation({ summary: 'List saved documents' })
  listDocuments(@CurrentUser() user: AuthenticatedCitizen) {
    return this.citizenProfileService.listSavedDocuments(user.id);
  }

  @Post('documents/uploads/request')
  @ApiOperation({ summary: 'Request upload URL for a profile document' })
  requestUpload(
    @CurrentUser() user: AuthenticatedCitizen,
    @Body() dto: RequestProfileUploadDto,
  ) {
    return this.citizenProfileService.requestUpload(user.id, dto);
  }

  @Post('documents/uploads/:uploadSessionId/file')
  @ApiOperation({ summary: 'Upload file bytes for a pending profile upload session' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  uploadSessionFile(
    @CurrentUser() user: AuthenticatedCitizen,
    @Param('uploadSessionId') uploadSessionId: string,
    @UploadedFile() file: UploadedFilePayload,
  ) {
    return this.citizenProfileService.uploadSessionFile(
      user.id,
      uploadSessionId,
      file,
    );
  }

  @Post('documents/uploads/complete')
  @ApiOperation({ summary: 'Complete profile document upload' })
  completeUpload(
    @CurrentUser() user: AuthenticatedCitizen,
    @Body() dto: CompleteProfileUploadDto,
  ) {
    return this.citizenProfileService.completeUpload(user.id, dto);
  }

  @Post('documents')
  @ApiOperation({ summary: 'Create a saved document metadata record' })
  createDocument(
    @CurrentUser() user: AuthenticatedCitizen,
    @Body() dto: CreateSavedDocumentDto,
  ) {
    return this.citizenProfileService.createSavedDocument(user.id, dto);
  }

  @Get('documents/:id/download')
  @ApiOperation({ summary: 'Get download URL for a saved document' })
  getDocumentDownload(
    @CurrentUser() user: AuthenticatedCitizen,
    @Param('id') id: string,
  ) {
    return this.citizenProfileService.getSavedDocumentDownloadUrl(user.id, id);
  }

  @Delete('documents/:id')
  @ApiOperation({ summary: 'Delete a saved document' })
  deleteDocument(
    @CurrentUser() user: AuthenticatedCitizen,
    @Param('id') id: string,
  ) {
    return this.citizenProfileService.deleteSavedDocument(user.id, id);
  }
}
