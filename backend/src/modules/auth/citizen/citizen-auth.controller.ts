import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

import {
  AuthType,
  CurrentUser,
  Public,
} from '@/common/decorators/auth.decorators';
import type { AuthenticatedCitizen } from '@/common/decorators/auth.decorators';
import { CitizenAuthService } from './citizen-auth.service';

class RequestOtpDto {
  @IsString()
  phone!: string;
}

class VerifyOtpDto {
  @IsString()
  phone!: string;

  @IsString()
  @Length(4, 6)
  code!: string;
}

class VerifyFirebaseDto {
  @IsString()
  idToken!: string;
}

class RefreshTokenDto {
  @IsString()
  refreshToken!: string;
}

class UpdateCitizenProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

@ApiTags('Citizen Auth')
@Controller('auth')
@AuthType('citizen')
export class CitizenAuthController {
  constructor(private readonly authService: CitizenAuthService) {}

  @Public()
  @Get('config')
  @ApiOperation({ summary: 'Citizen auth configuration for clients' })
  getAuthConfig() {
    return this.authService.getAuthConfig();
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('otp/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request OTP for phone login' })
  requestOtp(@Body() dto: RequestOtpDto) {
    return this.authService.requestOtp(dto.phone);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and issue tokens' })
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.phone, dto.code);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('firebase/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify Firebase Phone Auth ID token and issue Cybersave tokens' })
  verifyFirebase(@Body() dto: VerifyFirebaseDto) {
    return this.authService.verifyFirebaseToken(dto.idToken);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh citizen access token' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke refresh token' })
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current citizen profile' })
  me(@CurrentUser() user: AuthenticatedCitizen) {
    return this.authService.getProfile(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update citizen profile' })
  updateProfile(
    @CurrentUser() user: AuthenticatedCitizen,
    @Body() dto: UpdateCitizenProfileDto,
  ) {
    return this.authService.updateProfile(user.id, dto);
  }
}
