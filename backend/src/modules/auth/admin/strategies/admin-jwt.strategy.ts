import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthenticatedAdmin } from '@/common/decorators/auth.decorators';
import { PrismaService } from '@/database/database.module';

export interface AdminJwtPayload {
  sub: string;
  email: string;
  type: 'admin';
  aud: string;
  roles: string[];
  permissions: string[];
}

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('adminAuth.jwtSecret'),
      audience: configService.get<string>('adminAuth.jwtAudience'),
    });
  }

  async validate(payload: AdminJwtPayload): Promise<AuthenticatedAdmin> {
    if (payload.type !== 'admin') {
      throw new UnauthorizedException('Invalid token type');
    }

    const adminUser = await this.prisma.adminUser.findUnique({
      where: { id: payload.sub },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!adminUser || adminUser.status !== 'ACTIVE') {
      throw new UnauthorizedException('Admin account is not active');
    }

    const roles = adminUser.roles.map((r) => r.role.key);
    const permissions = [
      ...new Set(
        adminUser.roles.flatMap((r) =>
          r.role.permissions.map((rp) => rp.permission.key),
        ),
      ),
    ];

    return {
      id: adminUser.id,
      email: adminUser.email,
      type: 'admin',
      roles,
      permissions,
    };
  }
}
