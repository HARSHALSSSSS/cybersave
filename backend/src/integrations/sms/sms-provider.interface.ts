export interface SendSmsParams {
  to: string;
  message: string;
}

export interface SmsProvider {
  sendSms(params: SendSmsParams): Promise<void>;
}

export const SMS_PROVIDER = Symbol('SMS_PROVIDER');
