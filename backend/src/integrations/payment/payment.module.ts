import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { MockPaymentProvider } from './mock-payment.provider';
import { PAYMENT_PROVIDER } from './payment-provider.interface';
import { RazorpayPaymentProvider } from './razorpay-payment.provider';

@Module({
  imports: [ConfigModule],
  providers: [
    MockPaymentProvider,
    RazorpayPaymentProvider,
    {
      provide: PAYMENT_PROVIDER,
      useFactory: (
        config: ConfigService,
        mock: MockPaymentProvider,
        razorpay: RazorpayPaymentProvider,
      ) => {
        const provider = config.get<string>('payment.provider', 'mock');
        return provider === 'razorpay' ? razorpay : mock;
      },
      inject: [ConfigService, MockPaymentProvider, RazorpayPaymentProvider],
    },
  ],
  exports: [PAYMENT_PROVIDER, RazorpayPaymentProvider],
})
export class PaymentIntegrationModule {}
