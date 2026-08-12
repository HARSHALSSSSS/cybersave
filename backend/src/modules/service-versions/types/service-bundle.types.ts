import type { ServiceVersionsBundleService } from '../services/service-versions-bundle.service';

export type FullServiceBundle = Awaited<
  ReturnType<ServiceVersionsBundleService['getFullBundle']>
>;
