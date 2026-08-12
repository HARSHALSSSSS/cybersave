import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes, randomInt } from 'crypto';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '@/database/database.module';
import { SmsService } from '@/integrations/sms/sms.service';
import { CitizenJwtPayload } from './strategies/citizen-jwt.strategy';

@Injectable()
export class CitizenAuthService {
  private readonly logger = new Logger(CitizenAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly smsService: SmsService,
  ) {}

  async requestOtp(phone: string) {
    const normalizedPhone = this.normalizePhone(phone);
    const otpLength = this.configService.get<number>('citizenAuth.otpLength', 6);
    const expiresMinutes = this.configService.get<number>(
      'citizenAuth.otpExpiresMinutes',
      5,
    );

    const recentCount = await this.prisma.citizenOtpChallenge.count({
      where: {
        phone: normalizedPhone,
        createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
      },
    });

    if (recentCount >= 10) {
      throw new HttpException(
        'Too many OTP requests. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    await this.prisma.citizenOtpChallenge.updateMany({
      where: { phone: normalizedPhone, usedAt: null },
      data: { usedAt: new Date() },
    });

    const isDev = this.configService.get('app.nodeEnv') !== 'production';
    // Fixed OTP for local/testing so any phone can verify with 123456
    const code = isDev
      ? '123456'
      : randomInt(10 ** (otpLength - 1), 10 ** otpLength - 1).toString();
    // Faster hash in development so OTP requests feel instant on device
    const codeHash = await bcrypt.hash(code, isDev ? 4 : 10);
    const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);

    await this.prisma.citizenOtpChallenge.create({
      data: {
        phone: normalizedPhone,
        codeHash,
        expiresAt,
      },
    });

    await this.smsService.sendOtp(normalizedPhone, code);

    if (this.configService.get('app.nodeEnv') !== 'production') {
      this.logger.log(`[DEV OTP] ${normalizedPhone} => ${code}`);
    }

    return {
      message: 'OTP sent successfully',
      expiresAt,
      ...(this.configService.get('app.nodeEnv') !== 'production'
        ? { devCode: code }
        : {}),
    };
  }

  private normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `+91${digits}`;
    }
    if (digits.length === 12 && digits.startsWith('91')) {
      return `+${digits}`;
    }
    if (phone.trim().startsWith('+')) {
      return phone.replace(/\s+/g, '');
    }
    return phone.replace(/\s+/g, '');
  }

  private phoneLookupVariants(phone: string): string[] {
    const normalized = this.normalizePhone(phone);
    const digits = phone.replace(/\D/g, '');
    const last10 = digits.length >= 10 ? digits.slice(-10) : digits;
    const variants = new Set<string>([normalized, phone.replace(/\s+/g, '')]);
    if (last10.length === 10) {
      variants.add(last10);
      variants.add(`+91${last10}`);
      variants.add(`91${last10}`);
    }
    return [...variants];
  }

  async verifyOtp(phone: string, code: string) {
    const normalizedPhone = this.normalizePhone(phone);
    const phoneVariants = this.phoneLookupVariants(phone);
    const trimmedCode = code.trim();
    const isDev = this.configService.get('app.nodeEnv') !== 'production';

    const challenge = await this.prisma.citizenOtpChallenge.findFirst({
      where: {
        phone: { in: phoneVariants },
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!challenge) {
      throw new UnauthorizedException('OTP expired or not found');
    }

    const valid =
      (isDev && trimmedCode === '123456') ||
      (await bcrypt.compare(trimmedCode, challenge.codeHash));
    if (!valid) {
      throw new UnauthorizedException('Invalid OTP');
    }

    await this.prisma.citizenOtpChallenge.update({
      where: { id: challenge.id },
      data: { usedAt: new Date() },
    });

    let citizen = await this.prisma.citizen.findFirst({
      where: { phone: { in: phoneVariants } },
    });

    if (!citizen) {
      citizen = await this.prisma.citizen.create({
        data: { phone: normalizedPhone },
      });
    }

    if (citizen.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is suspended');
    }

    return this.issueTokens(citizen.id, citizen.phone);
  }

  async refreshTokens(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.prisma.citizenRefreshToken.findUnique({
      where: { tokenHash },
      include: { citizen: true },
    });

    if (
      !stored ||
      stored.revokedAt ||
      stored.expiresAt < new Date() ||
      stored.citizen.status !== 'ACTIVE'
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.citizenRefreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens(stored.citizen.id, stored.citizen.phone);
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    await this.prisma.citizenRefreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { message: 'Logged out successfully' };
  }

  async getProfile(citizenId: string) {
    const citizen = await this.prisma.citizen.findUniqueOrThrow({
      where: { id: citizenId },
      select: {
        id: true,
        phone: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        createdAt: true,
      },
    });
    return citizen;
  }

  async updateProfile(
    citizenId: string,
    data: { firstName?: string; lastName?: string; email?: string },
  ) {
    const citizen = await this.prisma.citizen.update({
      where: { id: citizenId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      },
      select: {
        id: true,
        phone: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        createdAt: true,
      },
    });
    return citizen;
  }

  private async issueTokens(citizenId: string, phone: string) {
    const payload: CitizenJwtPayload = {
      sub: citizenId,
      phone,
      type: 'citizen',
      aud: this.configService.get<string>(
        'citizenAuth.jwtAudience',
        'cybersave-mobile',
      ),
    };

    const accessToken = await this.jwtService.signAsync(
      payload as unknown as Record<string, unknown>,
      {
        secret: this.configService.getOrThrow<string>('citizenAuth.jwtSecret'),
        expiresIn: this.configService.get<string>('citizenAuth.jwtExpiresIn', '15m') as `${number}${'s' | 'm' | 'h' | 'd'}`,
      },
    );

    const refreshToken = randomBytes(48).toString('hex');
    const refreshDays = this.configService.get<number>(
      'citizenAuth.refreshTokenExpiresDays',
      30,
    );

    await this.prisma.citizenRefreshToken.create({
      data: {
        citizenId,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: new Date(Date.now() + refreshDays * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
