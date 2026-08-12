import { Injectable, Logger } from '@nestjs/common';

import { SendSmsParams, SmsProvider } from './sms-provider.interface';

@Injectable()
export class ConsoleSmsProvider implements SmsProvider {
  private readonly logger = new Logger(ConsoleSmsProvider.name);

  async sendSms(params: SendSmsParams): Promise<void> {
    this.logger.log(`[SMS] to=${params.to} message="${params.message}"`);
  }
}
