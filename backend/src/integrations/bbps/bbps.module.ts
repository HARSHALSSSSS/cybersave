import { Module, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { BBPS_PROVIDER } from './bbps-provider.interface';
import { MockBbpsProvider } from './mock-bbps.provider';
import { RazorpayBbpsProvider } from './razorpay-bbps.provider';

const bbpsLogger = new Logger('BbpsModule');

@Module({
  providers: [
    MockBbpsProvider,
    RazorpayBbpsProvider,
    {
      provide: BBPS_PROVIDER,
      inject: [ConfigService, MockBbpsProvider, RazorpayBbpsProvider],
      useFactory: (
        configService: ConfigService,
        mock: MockBbpsProvider,
        razorpay: RazorpayBbpsProvider,
      ) => {
        // Prefer process.env so hot-reload / .env changes are respected in dev
        const configured = (
          process.env.BBPS_PROVIDER ??
          configService.get<string>('bbps.provider') ??
          'mock'
        ).toLowerCase();
        const useMock =
          configured !== 'razorpay' ||
          (process.env.NODE_ENV !== 'production' &&
            process.env.BBPS_FORCE_RAZORPAY !== 'true');
        const provider = useMock ? mock : razorpay;
        bbpsLogger.log(
          `Active BBPS provider: ${provider.name} (BBPS_PROVIDER=${configured})`,
        );
        return provider;
      },
    },
  ],
  exports: [BBPS_PROVIDER, MockBbpsProvider, RazorpayBbpsProvider],
})
export class BbpsModule {}
