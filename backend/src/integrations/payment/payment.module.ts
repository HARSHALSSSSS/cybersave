import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { MockPaymentProvider } from './mock-payment.provider';
import { PAYMENT_PROVIDER } from './payment-provider.interface';
import { shouldUseRazorpayProvider } from './razorpay-enabled';
import { RazorpayPaymentProvider } from './razorpay-payment.provider';

const paymentLogger = new Logger('PaymentModule');

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
        const useRazorpay = shouldUseRazorpayProvider(config);
        paymentLogger.log(
          `Active payment provider: ${useRazorpay ? 'razorpay' : 'mock'} (PAYMENT_PROVIDER=${config.get('payment.provider', 'mock')})`,
        );
        return useRazorpay ? razorpay : mock;
      },
      inject: [ConfigService, MockPaymentProvider, RazorpayPaymentProvider],
    },
  ],
  exports: [PAYMENT_PROVIDER, RazorpayPaymentProvider],
})
export class PaymentIntegrationModule {}
