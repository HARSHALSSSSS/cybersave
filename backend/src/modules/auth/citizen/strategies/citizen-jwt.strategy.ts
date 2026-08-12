import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthenticatedCitizen } from '@/common/decorators/auth.decorators';
import { PrismaService } from '@/database/database.module';

export interface CitizenJwtPayload {
  sub: string;
  phone: string;
  type: 'citizen';
  aud: string;
}

@Injectable()
export class CitizenJwtStrategy extends PassportStrategy(
  Strategy,
  'citizen-jwt',
) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('citizenAuth.jwtSecret'),
      audience: configService.get<string>('citizenAuth.jwtAudience'),
    });
  }

  async validate(payload: CitizenJwtPayload): Promise<AuthenticatedCitizen> {
    if (payload.type !== 'citizen') {
      throw new UnauthorizedException('Invalid token type');
    }

    const citizen = await this.prisma.citizen.findUnique({
      where: { id: payload.sub },
    });

    if (!citizen || citizen.status !== 'ACTIVE') {
      throw new UnauthorizedException('Citizen account is not active');
    }

    return {
      id: citizen.id,
      phone: citizen.phone,
      type: 'citizen',
    };
  }
}
