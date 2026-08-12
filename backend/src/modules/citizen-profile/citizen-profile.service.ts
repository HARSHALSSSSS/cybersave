import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StoredFileStatus, UploadSessionStatus } from '@prisma/client';

import type { UploadedFilePayload } from '@/common/types/uploaded-file.type';
import { PrismaService } from '@/database/database.module';
import { StorageService } from '@/integrations/storage/storage.service';
import {
  CompleteProfileUploadDto,
  CreateAddressDto,
  CreateSavedDocumentDto,
  RequestProfileUploadDto,
  UpdateAddressDto,
} from './dto/citizen-profile.dto';

const UPLOAD_SESSION_TTL_MS = 15 * 60 * 1000;
const DEFAULT_MAX_FILE_BYTES = 10 * 1024 * 1024;

@Injectable()
export class CitizenProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  listAddresses(citizenId: string) {
    return this.prisma.citizenAddress.findMany({
      where: { citizenId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createAddress(citizenId: string, dto: CreateAddressDto) {
    const isDefault = dto.isDefault ?? false;

    return this.prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.citizenAddress.updateMany({
          where: { citizenId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const existingCount = await tx.citizenAddress.count({
        where: { citizenId },
      });

      return tx.citizenAddress.create({
        data: {
          citizenId,
          label: dto.label,
          line1: dto.line1,
          line2: dto.line2,
          city: dto.city,
          state: dto.state,
          pincode: dto.pincode,
          isDefault: isDefault || existingCount === 0,
        },
      });
    });
  }

  async updateAddress(
    citizenId: string,
    addressId: string,
    dto: UpdateAddressDto,
  ) {
    const address = await this.findOwnedAddress(citizenId, addressId);

    return this.prisma.$transaction(async (tx) => {
      if (dto.isDefault === true) {
        await tx.citizenAddress.updateMany({
          where: { citizenId, isDefault: true, NOT: { id: addressId } },
          data: { isDefault: false },
        });
      }

      if (dto.isDefault === false && address.isDefault) {
        throw new ForbiddenException(
          'Cannot unset default without selecting another default address',
        );
      }

      return tx.citizenAddress.update({
        where: { id: addressId },
        data: {
          ...(dto.label !== undefined ? { label: dto.label } : {}),
          ...(dto.line1 !== undefined ? { line1: dto.line1 } : {}),
          ...(dto.line2 !== undefined ? { line2: dto.line2 } : {}),
          ...(dto.city !== undefined ? { city: dto.city } : {}),
          ...(dto.state !== undefined ? { state: dto.state } : {}),
          ...(dto.pincode !== undefined ? { pincode: dto.pincode } : {}),
          ...(dto.isDefault !== undefined ? { isDefault: dto.isDefault } : {}),
        },
      });
    });
  }

  async deleteAddress(citizenId: string, addressId: string) {
    const address = await this.findOwnedAddress(citizenId, addressId);

    await this.prisma.$transaction(async (tx) => {
      await tx.citizenAddress.delete({ where: { id: addressId } });

      if (address.isDefault) {
        const next = await tx.citizenAddress.findFirst({
          where: { citizenId },
          orderBy: { createdAt: 'desc' },
        });
        if (next) {
          await tx.citizenAddress.update({
            where: { id: next.id },
            data: { isDefault: true },
          });
        }
      }
    });

    return { id: addressId, deleted: true };
  }

  listSavedDocuments(citizenId: string) {
    return this.prisma.citizenSavedDocument.findMany({
      where: { citizenId },
      orderBy: { createdAt: 'desc' },
      include: {
        storedFile: {
          select: {
            id: true,
            originalFileName: true,
            mimeType: true,
            sizeBytes: true,
            status: true,
            storageKey: true,
          },
        },
      },
    });
  }

  async requestUpload(citizenId: string, dto: RequestProfileUploadDto) {
    const maxFileSizeBytes = dto.maxFileSizeBytes ?? DEFAULT_MAX_FILE_BYTES;
    const storageKey = this.storageService.generateStorageKey(
      citizenId,
      dto.originalFileName,
    );
    const expiresAt = new Date(Date.now() + UPLOAD_SESSION_TTL_MS);

    const uploadSession = await this.prisma.uploadSession.create({
      data: {
        citizenId,
        expectedMimeType: dto.mimeType,
        expectedMaxSizeBytes: maxFileSizeBytes,
        originalFileName: dto.originalFileName,
        status: UploadSessionStatus.PENDING,
        expiresAt,
      },
    });

    const storedFile = await this.prisma.storedFile.create({
      data: {
        uploadSessionId: uploadSession.id,
        ownerCitizenId: citizenId,
        storageProvider: 'LOCAL',
        storageKey,
        originalFileName: dto.originalFileName,
        mimeType: dto.mimeType,
        status: StoredFileStatus.PENDING,
      },
    });

    const presigned = await this.storageService.requestUploadUrl({
      storageKey,
      mimeType: dto.mimeType,
      maxSizeBytes: maxFileSizeBytes,
      originalFileName: dto.originalFileName,
    });

    return {
      uploadSessionId: uploadSession.id,
      storedFileId: storedFile.id,
      ...presigned,
    };
  }

  async uploadSessionFile(
    citizenId: string,
    uploadSessionId: string,
    file: UploadedFilePayload,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('File is required');
    }

    const uploadSession = await this.prisma.uploadSession.findFirst({
      where: {
        id: uploadSessionId,
        citizenId,
        applicationId: null,
      },
    });

    if (!uploadSession) {
      throw new NotFoundException('Upload session not found');
    }

    if (uploadSession.status !== UploadSessionStatus.PENDING) {
      throw new BadRequestException('Upload session is no longer active');
    }

    if (uploadSession.expiresAt.getTime() < Date.now()) {
      await this.prisma.uploadSession.update({
        where: { id: uploadSession.id },
        data: { status: UploadSessionStatus.EXPIRED },
      });
      throw new BadRequestException('Upload session has expired');
    }

    const storedFile = await this.prisma.storedFile.findFirst({
      where: {
        ownerCitizenId: citizenId,
        uploadSessionId: uploadSession.id,
      },
    });

    if (!storedFile) {
      throw new NotFoundException('Stored file not found');
    }

    const metadata = await this.storageService.saveUploadedBytes(
      storedFile.storageKey,
      file.buffer,
      uploadSession.expectedMaxSizeBytes,
    );

    return {
      success: true,
      storageKey: storedFile.storageKey,
      sizeBytes: metadata.sizeBytes,
    };
  }

  async completeUpload(citizenId: string, dto: CompleteProfileUploadDto) {
    const uploadSession = await this.prisma.uploadSession.findFirst({
      where: {
        id: dto.uploadSessionId,
        citizenId,
        applicationId: null,
      },
    });

    if (!uploadSession) {
      throw new NotFoundException('Upload session not found');
    }

    if (uploadSession.status !== UploadSessionStatus.PENDING) {
      throw new BadRequestException('Upload session is no longer active');
    }

    if (uploadSession.expiresAt.getTime() < Date.now()) {
      await this.prisma.uploadSession.update({
        where: { id: uploadSession.id },
        data: { status: UploadSessionStatus.EXPIRED },
      });
      throw new BadRequestException('Upload session has expired');
    }

    const storedFile = await this.prisma.storedFile.findFirst({
      where: {
        id: dto.storedFileId,
        ownerCitizenId: citizenId,
        uploadSessionId: uploadSession.id,
      },
    });

    if (!storedFile) {
      throw new NotFoundException('Stored file not found');
    }

    const metadata = await this.storageService.verifyObject(storedFile.storageKey);
    if (!metadata.exists || metadata.sizeBytes <= 0) {
      throw new BadRequestException(
        'Uploaded file was not found in storage. Complete the upload first.',
      );
    }

    if (metadata.sizeBytes > uploadSession.expectedMaxSizeBytes) {
      throw new BadRequestException('Uploaded file exceeds maximum allowed size');
    }

    await this.prisma.$transaction([
      this.prisma.storedFile.update({
        where: { id: storedFile.id },
        data: {
          status: StoredFileStatus.UPLOADED,
          sizeBytes: metadata.sizeBytes,
          verifiedAt: new Date(),
        },
      }),
      this.prisma.uploadSession.update({
        where: { id: uploadSession.id },
        data: { status: UploadSessionStatus.COMPLETED },
      }),
    ]);

    return {
      storedFileId: storedFile.id,
      originalFileName: storedFile.originalFileName,
      mimeType: storedFile.mimeType,
      sizeBytes: metadata.sizeBytes,
    };
  }

  async getSavedDocumentDownloadUrl(citizenId: string, documentId: string) {
    const document = await this.prisma.citizenSavedDocument.findFirst({
      where: { id: documentId, citizenId },
      include: { storedFile: true },
    });

    if (!document) {
      throw new NotFoundException('Saved document not found');
    }

    if (!document.storedFile?.storageKey) {
      throw new BadRequestException('No file attached to this saved document');
    }

    return this.storageService.requestDownloadUrl({
      storageKey: document.storedFile.storageKey,
    });
  }

  async createSavedDocument(citizenId: string, dto: CreateSavedDocumentDto) {
    if (dto.storedFileId) {
      const storedFile = await this.prisma.storedFile.findFirst({
        where: {
          id: dto.storedFileId,
          ownerCitizenId: citizenId,
          status: {
            in: [
              StoredFileStatus.UPLOADED,
              StoredFileStatus.VERIFIED,
              StoredFileStatus.ATTACHED,
            ],
          },
        },
      });

      if (!storedFile) {
        throw new NotFoundException('Stored file not found');
      }

      return this.prisma.citizenSavedDocument.create({
        data: {
          citizenId,
          name: dto.name,
          documentType: dto.documentType,
          storedFileId: storedFile.id,
          mimeType: dto.mimeType ?? storedFile.mimeType,
          originalFileName:
            dto.originalFileName ?? storedFile.originalFileName,
        },
        include: {
          storedFile: {
            select: {
              id: true,
              originalFileName: true,
              mimeType: true,
              sizeBytes: true,
              status: true,
              storageKey: true,
            },
          },
        },
      });
    }

    return this.prisma.citizenSavedDocument.create({
      data: {
        citizenId,
        name: dto.name,
        documentType: dto.documentType,
        mimeType: dto.mimeType,
        originalFileName: dto.originalFileName,
      },
    });
  }

  async deleteSavedDocument(citizenId: string, documentId: string) {
    const document = await this.prisma.citizenSavedDocument.findFirst({
      where: { id: documentId, citizenId },
    });

    if (!document) {
      throw new NotFoundException('Saved document not found');
    }

    await this.prisma.citizenSavedDocument.delete({
      where: { id: documentId },
    });

    return { id: documentId, deleted: true };
  }

  private async findOwnedAddress(citizenId: string, addressId: string) {
    const address = await this.prisma.citizenAddress.findFirst({
      where: { id: addressId, citizenId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }
}
