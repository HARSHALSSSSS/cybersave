import type { ButtonHTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-semibold transition duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55',
        variant === 'primary' &&
          'bg-[#2563EB] text-white shadow-[0_4px_14px_rgba(37,99,235,0.28)] hover:bg-[#1E4BB5] hover:shadow-[0_6px_18px_rgba(37,99,235,0.32)]',
        variant === 'secondary' && 'bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE]',
        variant === 'outline' &&
          'border border-[#E2E8F0] bg-white text-[#0A1629] shadow-sm hover:border-[#CBD5E1] hover:bg-[#F8FAFC]',
        variant === 'ghost' && 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0A1629]',
        size === 'sm' && 'h-9 px-3.5 text-sm',
        size === 'md' && 'h-11 px-4 text-sm',
        size === 'lg' && 'h-12 px-6 text-base',
        className,
      )}
      {...props}
    />
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 text-sm text-[#0A1629] shadow-sm outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/12',
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('text-sm font-medium text-[#0A1629]', className)} {...props} />;
}
