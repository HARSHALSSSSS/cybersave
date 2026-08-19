import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'path';

import {
  adminAuthConfig,
  appConfig,
  citizenAuthConfig,
  databaseConfig,
  paymentConfig,
  bbpsConfig,
  firebaseConfig,
  smsConfig,
  whatsappConfig,
  redisConfig,
  storageConfig,
  throttlerConfig,
} from './env';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: resolve(process.cwd(), '.env'),
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
        firebaseConfig,
        smsConfig,
        whatsappConfig,
      ],
    }),
  ],
})
export class AppConfigModule {}
