import { Link } from 'react-router';
import { cn } from '@/lib/utils';
import {
  BRAND_LOCKUP_NAV_ASPECT,
  BRAND_LOCKUP_NAV_SRC,
  BRAND_LOCKUP_SRC,
  BRAND_LOGO_ALT,
} from './brand-assets';

type BrandMarkProps = {
  className?: string;
  linked?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

/** Max rendered height — width follows lockup aspect ratio. */
const SIZE = {
  sm: { maxH: 42, maxW: 160 },
  md: { maxH: 58, maxW: 220 },
  lg: { maxH: 68, maxW: 260 },
} as const;

/** Navbar / footer — icon + Cybersave wordmark (tagline removed, full glyph height kept). */
export function BrandMark({ className, linked = true, size = 'md' }: BrandMarkProps) {
  const { maxH, maxW } = SIZE[size];
  const width = Math.round(maxH * BRAND_LOCKUP_NAV_ASPECT);

  const img = (
    <img
      src={BRAND_LOCKUP_NAV_SRC}
      alt={BRAND_LOGO_ALT}
      width={width}
      height={maxH}
      draggable={false}
      className="block shrink-0 object-contain object-left"
      style={{ maxHeight: maxH, maxWidth: maxW, width: 'auto', height: 'auto' }}
    />
  );

  if (!linked) {
    return <span className={cn('inline-flex shrink-0 items-center', className)}>{img}</span>;
  }

  return (
    <Link
      to="/"
      className={cn(
        'inline-flex shrink-0 items-center transition-opacity hover:opacity-90',
        className,
      )}
      aria-label={BRAND_LOGO_ALT}
    >
      {img}
    </Link>
  );
}

export function BrandHeroLogo({ className }: { className?: string }) {
  return (
    <img
      src={BRAND_LOCKUP_SRC}
      alt={BRAND_LOGO_ALT}
      draggable={false}
      className={cn('h-auto w-[min(340px,88vw)] max-w-full object-contain', className)}
    />
  );
}
