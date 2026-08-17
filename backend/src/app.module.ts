import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AppConfigModule } from './config/config.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import {
  AdminJwtAuthGuard,
  CitizenJwtAuthGuard,
  PermissionsGuard,
} from './common/guards/auth.guards';
import { ResponseEnvelopeInterceptor } from './common/interceptors/response-envelope.interceptor';
import { DatabaseModule } from './database/database.module';
import { SmsModule } from './integrations/sms/sms.module';
import { StorageModule } from './integrations/storage/storage.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { AdminUsersModule } from './modules/admin-users/admin-users.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { AdminAuthModule } from './modules/auth/admin/admin-auth.module';
import { CitizenAuthModule } from './modules/auth/citizen/citizen-auth.module';
import { CitizenProfileModule } from './modules/citizen-profile/citizen-profile.module';
import { BillPaymentsModule } from './modules/bill-payments/bill-payments.module';
import { HomeBannersModule } from './modules/home-banners/home-banners.module';
import { GovernmentSchemesModule } from './modules/government-schemes/government-schemes.module';
import { ManualApplyModule } from './modules/manual-apply/manual-apply.module';
import { CitizensModule } from './modules/citizens/citizens.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { HealthModule } from './modules/health/health.module';
import { MainServicesModule } from './modules/main-services/main-services.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { RolesModule } from './modules/roles/roles.module';
import { ServiceVersionsModule } from './modules/service-versions/service-versions.module';
import { SubServicesModule } from './modules/sub-services/sub-services.module';
import { SupportTicketsModule } from './modules/support-tickets/support-tickets.module';

@Module({
  imports: [
    AppConfigModule,
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('throttler.ttlMs', 60000),
          limit: configService.get<number>('throttler.limit', 100),
        },
      ],
    }),
    DatabaseModule,
    SmsModule,
    StorageModule,
    CitizenAuthModule,
    AdminAuthModule,
    HealthModule,
    RolesModule,
    AdminUsersModule,
    MainServicesModule,
    SubServicesModule,
    ServiceVersionsModule,
    ApplicationsModule,
    AuditLogsModule,
    NotificationsModule,
    PaymentsModule,
    DashboardModule,
    SupportTicketsModule,
    CitizensModule,
    CitizenProfileModule,
    BillPaymentsModule,
    HomeBannersModule,
    GovernmentSchemesModule,
    ManualApplyModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseEnvelopeInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CitizenJwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AdminJwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
