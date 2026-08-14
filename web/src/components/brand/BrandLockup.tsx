import { cn } from '@/lib/utils';
import { BRAND_LOGO_ALT, BRAND_LOGO_SRC } from './brand-assets';

type BrandLockupProps = {
  /** Lockup width in px (height matches — asset is square) */
  size?: number;
  className?: string;
};

/** Full Cybersave lockup: icon + wordmark + tagline from brand-logo.png */
export function BrandLockup({ size = 280, className }: BrandLockupProps) {
  return (
    <div className={cn('flex justify-center', className)}>
      <img
        src={BRAND_LOGO_SRC}
        alt={BRAND_LOGO_ALT}
        width={size}
        height={size}
        draggable={false}
        className="mx-auto block max-w-full object-contain object-center"
        style={{ width: size, height: size }}
      />
    </div>
  );
}
