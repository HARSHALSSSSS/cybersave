import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '@/database/database.module';
import { AdminJwtPayload } from './strategies/admin-jwt.strategy';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(email: string, password: string) {
    const adminUser = await this.prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: { include: { permission: true } },
              },
            },
          },
        },
      },
    });

    if (!adminUser || adminUser.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(password, adminUser.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const roles = adminUser.roles.map((r) => r.role.key);
    const permissions = [
      ...new Set(
        adminUser.roles.flatMap((r) =>
          r.role.permissions.map((rp) => rp.permission.key),
        ),
      ),
    ];

    return this.issueTokens(
      adminUser.id,
      adminUser.email,
      roles,
      permissions,
    );
  }

  async refreshTokens(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.prisma.adminRefreshToken.findUnique({
      where: { tokenHash },
      include: {
        adminUser: {
          include: {
            roles: {
              include: {
                role: {
                  include: {
                    permissions: { include: { permission: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (
      !stored ||
      stored.revokedAt ||
      stored.expiresAt < new Date() ||
      stored.adminUser.status !== 'ACTIVE'
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.adminRefreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const roles = stored.adminUser.roles.map((r) => r.role.key);
    const permissions = [
      ...new Set(
        stored.adminUser.roles.flatMap((r) =>
          r.role.permissions.map((rp) => rp.permission.key),
        ),
      ),
    ];

    return this.issueTokens(
      stored.adminUser.id,
      stored.adminUser.email,
      roles,
      permissions,
    );
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    await this.prisma.adminRefreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { message: 'Logged out successfully' };
  }

  async getProfile(adminUserId: string) {
    const adminUser = await this.prisma.adminUser.findUniqueOrThrow({
      where: { id: adminUserId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        createdAt: true,
        roles: {
          include: {
            role: {
              select: { id: true, key: true, name: true },
            },
          },
        },
      },
    });

    const permissions = await this.getPermissionsForAdmin(adminUserId);

    return {
      ...adminUser,
      roles: adminUser.roles.map((r) => r.role),
      permissions,
    };
  }

  async updateProfile(
    adminUserId: string,
    data: { firstName?: string; lastName?: string },
  ) {
    await this.prisma.adminUser.update({
      where: { id: adminUserId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });
    return this.getProfile(adminUserId);
  }

  async changePassword(
    adminUserId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const adminUser = await this.prisma.adminUser.findUniqueOrThrow({
      where: { id: adminUserId },
    });

    const valid = await bcrypt.compare(currentPassword, adminUser.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (currentPassword === newPassword) {
      throw new BadRequestException('New password must differ from current password');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.adminUser.update({
      where: { id: adminUserId },
      data: { passwordHash },
    });

    return { message: 'Password updated successfully' };
  }

  private async getPermissionsForAdmin(adminUserId: string): Promise<string[]> {
    const adminUser = await this.prisma.adminUser.findUniqueOrThrow({
      where: { id: adminUserId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: { include: { permission: true } },
              },
            },
          },
        },
      },
    });

    return [
      ...new Set(
        adminUser.roles.flatMap((r) =>
          r.role.permissions.map((rp) => rp.permission.key),
        ),
      ),
    ];
  }

  private async issueTokens(
    adminUserId: string,
    email: string,
    roles: string[],
    permissions: string[],
  ) {
    const payload: AdminJwtPayload = {
      sub: adminUserId,
      email,
      type: 'admin',
      aud: this.configService.get<string>(
        'adminAuth.jwtAudience',
        'cybersave-admin',
      ),
      roles,
      permissions,
    };

    const accessToken = await this.jwtService.signAsync(
      payload as unknown as Record<string, unknown>,
      {
        secret: this.configService.getOrThrow<string>('adminAuth.jwtSecret'),
        expiresIn: this.configService.get<string>('adminAuth.jwtExpiresIn', '15m') as `${number}${'s' | 'm' | 'h' | 'd'}`,
      },
    );

    const refreshToken = randomBytes(48).toString('hex');
    const refreshDays = this.configService.get<number>(
      'adminAuth.refreshTokenExpiresDays',
      7,
    );

    await this.prisma.adminRefreshToken.create({
      data: {
        adminUserId,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: new Date(Date.now() + refreshDays * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      roles,
      permissions,
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
