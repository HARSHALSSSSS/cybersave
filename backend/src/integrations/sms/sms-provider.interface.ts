export interface SendSmsParams {
  to: string;
  message: string;
  /** Used by WhatsApp template provider; optional for console SMS. */
  otpCode?: string;
}

export interface SmsProvider {
  sendSms(params: SendSmsParams): Promise<void>;
}

export const SMS_PROVIDER = Symbol('SMS_PROVIDER');
