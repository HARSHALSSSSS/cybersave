import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { CitizenJwtAuthGuard } from '@/common/guards/auth.guards';
import { SmsModule } from '@/integrations/sms/sms.module';
import { CitizenAuthController } from './citizen-auth.controller';
import { CitizenAuthService } from './citizen-auth.service';
import { CitizenJwtStrategy } from './strategies/citizen-jwt.strategy';

@Module({
  imports: [
    SmsModule,
    PassportModule.register({ defaultStrategy: 'citizen-jwt' }),
    JwtModule.register({}),
  ],
  controllers: [CitizenAuthController],
  providers: [CitizenAuthService, CitizenJwtStrategy, CitizenJwtAuthGuard],
  exports: [CitizenAuthService, CitizenJwtAuthGuard, JwtModule],
})
export class CitizenAuthModule {}
