import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { WhatsAppCloudProvider } from '../whatsapp/whatsapp-cloud.provider';
import { ConsoleSmsProvider } from './console-sms.provider';
import { SMS_PROVIDER } from './sms-provider.interface';
import { SmsService } from './sms.service';

@Module({
  providers: [
    ConsoleSmsProvider,
    WhatsAppCloudProvider,
    SmsService,
    {
      provide: SMS_PROVIDER,
      inject: [ConfigService, ConsoleSmsProvider, WhatsAppCloudProvider],
      useFactory: (
        configService: ConfigService,
        consoleProvider: ConsoleSmsProvider,
        whatsappProvider: WhatsAppCloudProvider,
      ) => {
        const provider = configService.get<string>('sms.provider', 'console').toLowerCase();
        if (provider === 'whatsapp') {
          return whatsappProvider;
        }
        return consoleProvider;
      },
    },
  ],
  exports: [SmsService, SMS_PROVIDER],
})
export class SmsModule {}
