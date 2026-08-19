import { Inject, Injectable } from '@nestjs/common';

import type { SmsProvider } from './sms-provider.interface';
import { SendSmsParams, SMS_PROVIDER } from './sms-provider.interface';

@Injectable()
export class SmsService {
  constructor(@Inject(SMS_PROVIDER) private readonly provider: SmsProvider) {}

  sendOtp(phone: string, code: string): Promise<void> {
    return this.provider.sendSms({
      to: phone,
      otpCode: code,
      message: `Your Cybersave verification code is ${code}. Do not share this code.`,
    });
  }

  send(params: SendSmsParams): Promise<void> {
    return this.provider.sendSms(params);
  }
}
