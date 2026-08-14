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
        'inline-flex items-center justify-center rounded-xl font-semibold transition-colors disabled:opacity-60',
        variant === 'primary' && 'bg-[#2563EB] text-white hover:bg-[#1E4BB5]',
        variant === 'secondary' && 'bg-white text-[#2563EB] hover:bg-blue-50',
        variant === 'outline' && 'border border-[#E5E7EB] bg-white text-[#0A1629] hover:bg-gray-50',
        variant === 'ghost' && 'text-[#6B7280] hover:bg-gray-100',
        size === 'sm' && 'h-9 px-3 text-sm',
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
        'h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#0A1629] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20',
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('text-sm font-medium text-[#0A1629]', className)} {...props} />;
}
