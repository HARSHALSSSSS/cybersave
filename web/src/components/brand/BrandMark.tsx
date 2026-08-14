import { Link } from 'react-router';
import { cn } from '@/lib/utils';
import { BRAND_LOGO_ALT, BRAND_LOGO_SRC } from './brand-assets';

type BrandMarkProps = {
  className?: string;
  /** Light wordmark for dark backgrounds (footer) */
  light?: boolean;
  /** Link to home (default true). Set false for static display (e.g. loading). */
  linked?: boolean;
  /** Show icon only without wordmark */
  iconOnly?: boolean;
};

/** Cybersave icon (top crop of brand asset) + split wordmark — no circle mask */
function BrandIcon({ light = false }: { light?: boolean }) {
  return (
    <img
      src={BRAND_LOGO_SRC}
      alt=""
      aria-hidden
      draggable={false}
      className={cn(
        'h-11 w-11 shrink-0 object-cover object-[center_8%]',
        light
          ? 'brightness-0 invert drop-shadow-[0_0_12px_rgba(96,165,250,0.35)]'
          : 'mix-blend-screen drop-shadow-[0_2px_8px_rgba(37,99,235,0.2)]',
      )}
      style={{ clipPath: 'inset(0 0 56% 0)' }}
    />
  );
}

function BrandWordmark({ light = false }: { light?: boolean }) {
  if (light) {
    return (
      <span className="font-display text-[1.35rem] leading-none font-bold tracking-tight text-white">
        Cybersave
      </span>
    );
  }

  return (
    <span className="font-display text-[1.35rem] leading-none font-bold tracking-tight">
      <span className="text-[#0A1629]">Cyber</span>
      <span className="text-[#2563EB]">save</span>
    </span>
  );
}

/** Navbar / footer logo — open transparent icon beside wordmark */
export function BrandMark({
  className,
  light = false,
  linked = true,
  iconOnly = false,
}: BrandMarkProps) {
  const content = (
    <>
      <BrandIcon light={light} />
      {!iconOnly ? <BrandWordmark light={light} /> : null}
    </>
  );

  if (!linked) {
    return (
      <span className={cn('inline-flex shrink-0 items-center gap-2.5', className)}>
        {content}
      </span>
    );
  }

  return (
    <Link
      to="/"
      className={cn('inline-flex shrink-0 items-center gap-2.5', className)}
      aria-label={BRAND_LOGO_ALT}
    >
      {content}
    </Link>
  );
}

/** Larger hero lockup — full logo openly on page, transparent blend */
export function BrandHeroLogo({ className }: { className?: string }) {
  return (
    <img
      src={BRAND_LOGO_SRC}
      alt={BRAND_LOGO_ALT}
      draggable={false}
      className={cn(
        'h-auto w-[min(280px,72vw)] max-w-full object-contain mix-blend-screen',
        className,
      )}
    />
  );
}
