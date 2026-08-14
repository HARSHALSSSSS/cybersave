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
      <div
        className="overflow-hidden rounded-3xl bg-[#0B1220] p-2 shadow-[0_16px_40px_rgba(15,23,42,0.2)] ring-1 ring-[#2563EB]/20"
        style={{ width: size, height: size }}
      >
        <img
          src={BRAND_LOGO_SRC}
          alt={BRAND_LOGO_ALT}
          width={size}
          height={size}
          draggable={false}
          className="block h-full w-full object-contain object-center"
        />
      </div>
    </div>
  );
}
