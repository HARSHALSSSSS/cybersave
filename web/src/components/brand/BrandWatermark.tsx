import { cn } from '@/lib/utils';
import { BRAND_LOGO_SRC } from './brand-assets';

/** Decorative faded logo for hero cards — official asset only, no generic icons */
export function BrandWatermark({ className, size = 160 }: { className?: string; size?: number }) {
  return (
    <img
      src={BRAND_LOGO_SRC}
      alt=""
      aria-hidden
      draggable={false}
      width={size}
      height={size}
      className={cn('pointer-events-none select-none object-contain opacity-[0.12]', className)}
    />
  );
}
