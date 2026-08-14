import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function PortalCard({
  className,
  children,
  padding = 'md',
}: {
  className?: string;
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}) {
  const pad =
    padding === 'none'
      ? ''
      : padding === 'sm'
        ? 'p-4'
        : padding === 'lg'
          ? 'p-8'
          : 'p-6';
  return (
    <div
      className={cn(
        'rounded-2xl border border-[#E8EDF5] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)] transition hover:shadow-[0_4px_20px_rgba(15,23,42,0.07)]',
        pad,
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-xl font-bold tracking-tight text-[#0A1629] sm:text-2xl">{title}</h2>
        {subtitle ? <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#64748B]">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function StatusPill({
  children,
  tone = 'blue',
  className,
}: {
  children: ReactNode;
  tone?: 'blue' | 'green' | 'amber' | 'red' | 'slate';
  className?: string;
}) {
  const tones = {
    blue: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    slate: 'bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit?.();
      }}
      className={cn(
        'flex overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/15',
        className,
      )}
    >
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-[#94A3B8]"
      />
      <button
        type="submit"
        className="shrink-0 bg-[#2563EB] px-6 text-sm font-semibold text-white transition hover:bg-[#1E4BB5]"
      >
        Search
      </button>
    </form>
  );
}

export function FilterPills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-medium transition',
            value === opt.id
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#CBD5E1]',
          )}
        >
          {opt.label}
          {opt.count !== undefined ? ` (${opt.count})` : ''}
        </button>
      ))}
    </div>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('h-2 overflow-hidden rounded-full bg-[#E8EDF5]', className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#60A5FA] transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
