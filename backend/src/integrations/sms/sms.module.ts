import { Module } from '@nestjs/common';

import { ConsoleSmsProvider } from './console-sms.provider';
import { SMS_PROVIDER } from './sms-provider.interface';
import { SmsService } from './sms.service';

@Module({
  providers: [
    ConsoleSmsProvider,
    SmsService,
    {
      provide: SMS_PROVIDER,
      useExisting: ConsoleSmsProvider,
    },
  ],
  exports: [SmsService, SMS_PROVIDER],
})
export class SmsModule {}
