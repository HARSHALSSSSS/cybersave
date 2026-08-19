import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { SendSmsParams, SmsProvider } from '../sms/sms-provider.interface';

type TemplateStyle = 'body' | 'auth';

@Injectable()
export class WhatsAppCloudProvider implements SmsProvider {
  private readonly logger = new Logger(WhatsAppCloudProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async sendSms(params: SendSmsParams): Promise<void> {
    const accessToken = this.configService.get<string>('whatsapp.accessToken');
    const phoneNumberId = this.configService.get<string>('whatsapp.phoneNumberId');
    const templateName = this.configService.get<string>('whatsapp.otpTemplateName');
    const templateLanguage = this.configService.get<string>('whatsapp.templateLanguage');
    const templateStyle = this.configService.get<TemplateStyle>(
      'whatsapp.templateStyle',
      'body',
    );
    const apiVersion = this.configService.get<string>('whatsapp.apiVersion', 'v21.0');

    if (!accessToken?.trim() || !phoneNumberId?.trim() || !templateName?.trim()) {
      throw new Error(
        'WhatsApp Cloud API is not configured. Set WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, and WHATSAPP_OTP_TEMPLATE_NAME.',
      );
    }

    const otpCode = params.otpCode ?? this.extractOtpFromMessage(params.message);
    const to = this.toWhatsAppRecipient(params.to);
    const components = this.buildTemplateComponents(otpCode, templateStyle);

    const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: templateLanguage ?? 'en' },
          components,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      this.logger.error(`WhatsApp API error ${response.status}: ${errorBody}`);
      throw new Error(
        `Could not deliver OTP on WhatsApp (${response.status}). Check Meta template name, language, and phone number.`,
      );
    }

    this.logger.log(`[WhatsApp OTP] sent to ${to}`);
  }

  private toWhatsAppRecipient(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `91${digits}`;
    }
    return digits;
  }

  private extractOtpFromMessage(message: string): string {
    const match = message.match(/\b(\d{4,8})\b/);
    if (!match) {
      throw new Error('OTP code missing from outbound message');
    }
    return match[1];
  }

  private buildTemplateComponents(otpCode: string, style: TemplateStyle) {
    const body = {
      type: 'body',
      parameters: [{ type: 'text', text: otpCode }],
    };

    if (style === 'auth') {
      return [
        body,
        {
          type: 'button',
          sub_type: 'url',
          index: '0',
          parameters: [{ type: 'text', text: otpCode }],
        },
      ];
    }

    return [body];
  }
}
