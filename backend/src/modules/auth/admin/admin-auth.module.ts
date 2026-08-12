import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import {
  AdminJwtAuthGuard,
  PermissionsGuard,
} from '@/common/guards/auth.guards';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { AdminJwtStrategy } from './strategies/admin-jwt.strategy';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'admin-jwt' }), JwtModule.register({})],
  controllers: [AdminAuthController],
  providers: [
    AdminAuthService,
    AdminJwtStrategy,
    AdminJwtAuthGuard,
    PermissionsGuard,
  ],
  exports: [
    AdminAuthService,
    AdminJwtAuthGuard,
    PermissionsGuard,
    JwtModule,
  ],
})
export class AdminAuthModule {}
