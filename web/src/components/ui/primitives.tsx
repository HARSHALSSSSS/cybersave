import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function ServiceIcon({
  icon,
  color,
  bg,
  size = 'md',
}: {
  icon: string;
  color: string;
  bg: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClass = size === 'sm' ? 'h-9 w-9 text-base' : size === 'lg' ? 'h-12 w-12 text-xl' : 'h-10 w-10 text-lg';
  const glyph =
    icon === 'shield'
      ? '🛡'
      : icon === 'card'
        ? '🪪'
        : icon === 'badge'
          ? '📜'
          : icon === 'bill'
            ? '⚡'
            : icon === 'bank'
              ? '🏦'
              : icon === 'book'
                ? '📚'
                : icon === 'health'
                  ? '❤'
                  : icon === 'transport'
                    ? '🚌'
                    : icon === 'home'
                      ? '🏠'
                      : icon === 'building'
                        ? '🏛'
                        : icon === 'umbrella'
                          ? '☂️'
                          : '📋';

  return (
    <span
      className={cn('inline-flex items-center justify-center rounded-xl', sizeClass)}
      style={{ backgroundColor: bg, color }}
    >
      {glyph}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.replace(/_/g, ' ');
  const tone =
    status === 'COMPLETED' || status === 'APPROVED'
      ? 'bg-green-50 text-green-700 border-green-200'
      : status === 'REJECTED' || status === 'CANCELLED'
        ? 'bg-red-50 text-red-700 border-red-200'
        : 'bg-amber-50 text-amber-700 border-amber-200';

  return (
    <span className={cn('inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium', tone)}>
      {normalized}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  className,
  action,
}: {
  title: string;
  description?: string;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div className={cn('rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-6 py-12 text-center', className)}>
      <p className="text-base font-semibold text-[#0A1629]">{title}</p>
      {description ? <p className="mt-2 text-sm text-[#6B7280]">{description}</p> : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function LoadingBlock({
  className,
  message = 'Loading…',
}: {
  className?: string;
  message?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#E8EDF5] bg-white px-6 py-16 text-center',
        className,
      )}
    >
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#2563EB]" />
      <p className="text-sm text-[#64748B]">{message}</p>
    </div>
  );
}
