import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type StatTrendDirection = 'up' | 'down' | 'neutral';

export interface StatTrend {
  value: string;
  direction: StatTrendDirection;
}

export interface StatCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  icon: LucideIcon;
  title: string;
  value: React.ReactNode;
  /** Icon glyph color, e.g. "#2563EB". Falls back to the primary token. */
  iconColor?: string;
  /** Icon chip background color, e.g. "#EEF4FF". Falls back to the accent token. */
  iconBg?: string;
  trend?: StatTrend;
  /** Secondary caption below the value/trend, e.g. "vs last month". */
  description?: string;
}

/** KPI stat card matching the Figma dashboard cards — icon chip, label, value, trend. */
export function StatCard({
  icon: Icon,
  title,
  value,
  iconColor,
  iconBg,
  trend,
  description,
  className,
  ...props
}: StatCardProps) {
  return (
    <Card className={cn('h-full', className)} {...props}>
      <CardContent className="flex h-full items-center justify-between gap-3 !py-5">
        <div className="flex min-w-0 flex-col justify-center gap-1.5">
          <p className="text-sm leading-5 font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl leading-8 font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {(trend || description) && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-xs leading-4">
              {trend ? (
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 font-medium',
                    trend.direction === 'up' && 'text-success-text',
                    trend.direction === 'down' && 'text-danger-text',
                    trend.direction === 'neutral' && 'text-muted-foreground',
                  )}
                >
                  {trend.direction === 'up' && <ArrowUpRight className="size-3.5" />}
                  {trend.direction === 'down' && <ArrowDownRight className="size-3.5" />}
                  {trend.direction === 'neutral' && <Minus className="size-3.5" />}
                  {trend.value}
                </span>
              ) : null}
              {description ? (
                <span className="leading-4 text-muted-foreground">{description}</span>
              ) : null}
            </div>
          )}
        </div>
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-lg"
          style={{
            backgroundColor: iconBg ?? 'var(--color-accent)',
            color: iconColor ?? 'var(--color-primary)',
          }}
        >
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
