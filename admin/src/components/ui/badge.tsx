import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

export const badgeVariants = cva(
  'inline-flex h-6 w-fit shrink-0 items-center gap-1 rounded-full border px-2.5 text-xs leading-none font-medium whitespace-nowrap transition-colors duration-150 [&_svg]:size-3 [&_svg]:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'border-border bg-transparent text-foreground',
        success: 'border-success-border bg-success-bg text-success-text',
        completed: 'border-success-border bg-success-bg text-success-text',
        warning: 'border-warning-border bg-warning-bg text-warning-text',
        pending: 'border-warning-border bg-warning-bg text-warning-text',
        danger: 'border-danger-border bg-danger-bg text-danger-text',
        rejected: 'border-danger-border bg-danger-bg text-danger-text',
        blocked: 'border-danger-border bg-danger-bg text-danger-text',
        info: 'border-info-border bg-info-bg text-info-text',
        review: 'border-info-border bg-info-bg text-info-text',
        muted: 'border-muted-status-border bg-muted-status-bg text-muted-status-text',
        unverified: 'border-muted-status-border bg-muted-status-bg text-muted-status-text',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}

export function Badge({ className, variant, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot : 'span';
  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}
