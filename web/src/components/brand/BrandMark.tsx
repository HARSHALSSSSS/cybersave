import { Link } from 'react-router';
import { cn } from '@/lib/utils';
import { BRAND_LOGO_ALT, BRAND_LOGO_SRC, BRAND_TAGLINE } from './brand-assets';

type BrandMarkProps = {
  className?: string;
  /** Light wordmark for dark backgrounds (footer) */
  light?: boolean;
  /** Link to home (default true). Set false for static display (e.g. loading). */
  linked?: boolean;
  /** Show icon only without wordmark */
  iconOnly?: boolean;
  /** Visual size */
  size?: 'sm' | 'md' | 'lg';
};

const SIZE = {
  sm: { box: 'h-9 w-9', word: 'text-[1.05rem]', gap: 'gap-2' },
  md: { box: 'h-11 w-11', word: 'text-[1.35rem]', gap: 'gap-2.5' },
  lg: { box: 'h-14 w-14', word: 'text-[1.55rem]', gap: 'gap-3' },
} as const;

/**
 * Official mark: C + shield from brand-logo.png inside a navy tile
 * (asset has a black background — this keeps it crisp on light and dark UI).
 */
function BrandIcon({ size = 'md' }: { size?: keyof typeof SIZE }) {
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 overflow-hidden rounded-xl bg-[#0B1220] shadow-[0_2px_10px_rgba(37,99,235,0.18)] ring-1 ring-[#2563EB]/25',
        SIZE[size].box,
      )}
    >
      <img
        src={BRAND_LOGO_SRC}
        alt=""
        aria-hidden
        draggable={false}
        className="absolute inset-[-18%] h-[136%] w-[136%] max-w-none object-cover object-[center_6%]"
      />
    </span>
  );
}

function BrandWordmark({
  light = false,
  size = 'md',
}: {
  light?: boolean;
  size?: keyof typeof SIZE;
}) {
  if (light) {
    return (
      <span className={cn('font-display leading-none font-bold tracking-tight text-white', SIZE[size].word)}>
        Cybersave
      </span>
    );
  }

  return (
    <span className={cn('font-display leading-none font-bold tracking-tight', SIZE[size].word)}>
      <span className="text-[#0A1629]">Cyber</span>
      <span className="text-[#2563EB]">save</span>
    </span>
  );
}

/** Navbar / footer logo — crisp icon tile + wordmark */
export function BrandMark({
  className,
  light = false,
  linked = true,
  iconOnly = false,
  size = 'md',
}: BrandMarkProps) {
  const content = (
    <>
      <BrandIcon size={size} />
      {!iconOnly ? (
        <span className="flex min-w-0 flex-col justify-center">
          <BrandWordmark light={light} size={size} />
          {size === 'lg' ? (
            <span
              className={cn(
                'mt-1 text-[10px] font-semibold tracking-[0.14em] uppercase',
                light ? 'text-[#94A3B8]' : 'text-[#64748B]',
              )}
            >
              {BRAND_TAGLINE}
            </span>
          ) : null}
        </span>
      ) : null}
    </>
  );

  const classes = cn('inline-flex shrink-0 items-center', SIZE[size].gap, className);

  if (!linked) {
    return <span className={classes}>{content}</span>;
  }

  return (
    <Link to="/" className={cn(classes, 'transition-opacity hover:opacity-90')} aria-label={BRAND_LOGO_ALT}>
      {content}
    </Link>
  );
}

/** Larger hero lockup — full square logo in a soft frame */
export function BrandHeroLogo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'inline-flex rounded-3xl bg-[#0B1220] p-3 shadow-[0_20px_50px_rgba(15,23,42,0.25)] ring-1 ring-white/10',
        className,
      )}
    >
      <img
        src={BRAND_LOGO_SRC}
        alt={BRAND_LOGO_ALT}
        draggable={false}
        className="h-auto w-[min(260px,70vw)] max-w-full object-contain"
      />
    </div>
  );
}
