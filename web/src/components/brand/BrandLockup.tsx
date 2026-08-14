import { cn } from '@/lib/utils';
import { BRAND_LOCKUP_ASPECT, BRAND_LOCKUP_SRC, BRAND_LOGO_ALT } from './brand-assets';

type BrandLockupProps = {
  /** Lockup height in px. */
  size?: number;
  className?: string;
};

/** Auth / splash — full Cybersave logo with name. */
export function BrandLockup({ size = 72, className }: BrandLockupProps) {
  const width = Math.round(size * BRAND_LOCKUP_ASPECT);
  return (
    <div className={cn('flex justify-center', className)}>
      <img
        src={BRAND_LOCKUP_SRC}
        alt={BRAND_LOGO_ALT}
        width={width}
        height={size}
        draggable={false}
        className="block max-w-full object-contain"
        style={{ height: size, width: 'auto', maxWidth: width }}
      />
    </div>
  );
}
