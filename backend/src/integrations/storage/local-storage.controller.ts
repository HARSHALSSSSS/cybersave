import {
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  Put,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';

import { Public } from '@/common/decorators/auth.decorators';
import { LocalStorageProvider } from './local-storage.provider';

@ApiExcludeController()
@Controller('storage/local')
export class LocalStorageController {
  constructor(private readonly localStorage: LocalStorageProvider) {}

  @Public()
  @Put('upload/:storageKey')
  async upload(
    @Param('storageKey') storageKey: string,
    @Query('token') token: string,
    @Query('expiresAt') expiresAtRaw: string,
    @Headers('x-max-size') maxSizeHeader: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const decodedKey = decodeURIComponent(storageKey);
    const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : new Date(NaN);

    if (
      !token ||
      Number.isNaN(expiresAt.getTime()) ||
      !this.localStorage.verifyToken(decodedKey, token, expiresAt)
    ) {
      throw new UnauthorizedException('Invalid or expired upload token');
    }

    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);
    const parsed = parseInt(maxSizeHeader ?? '', 10);
    const maxSize =
      Number.isFinite(parsed) && parsed > 0 ? parsed : 10 * 1024 * 1024;

    await this.localStorage.saveUploadedFile(decodedKey, buffer, maxSize);
    res.status(200).json({ success: true, storageKey: decodedKey });
  }

  @Public()
  @Get('download/:storageKey')
  async download(
    @Param('storageKey') storageKey: string,
    @Query('token') token: string,
    @Query('expiresAt') expiresAtRaw: string,
    @Res() res: Response,
  ): Promise<void> {
    const decodedKey = decodeURIComponent(storageKey);
    const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : new Date(NaN);

    if (
      !token ||
      Number.isNaN(expiresAt.getTime()) ||
      !this.localStorage.verifyToken(decodedKey, token, expiresAt)
    ) {
      throw new UnauthorizedException('Invalid or expired download token');
    }

    const filePath = this.localStorage.resolvePath(decodedKey);
    try {
      await stat(filePath);
    } catch {
      throw new NotFoundException('File not found');
    }

    res.setHeader('Content-Type', 'application/octet-stream');
    createReadStream(filePath).pipe(res);
  }
}
