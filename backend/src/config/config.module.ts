import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import {
  adminAuthConfig,
  appConfig,
  citizenAuthConfig,
  databaseConfig,
  paymentConfig,
  bbpsConfig,
  redisConfig,
  storageConfig,
  throttlerConfig,
} from './env';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        redisConfig,
        citizenAuthConfig,
        adminAuthConfig,
        storageConfig,
        throttlerConfig,
        paymentConfig,
        bbpsConfig,
      ],
    }),
  ],
})
export class AppConfigModule {}
