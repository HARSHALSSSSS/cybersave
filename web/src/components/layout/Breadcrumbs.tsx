import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type BreadcrumbItem = {
  label: string;
  to?: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-1">
            {index > 0 ? <ChevronRight className="h-3.5 w-3.5 text-[#CBD5E1]" /> : null}
            {item.to && !isLast ? (
              <Link
                to={item.to}
                className="rounded-md px-1 py-0.5 text-[#64748B] transition hover:bg-[#EFF6FF] hover:text-[#2563EB]"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  'rounded-md px-1 py-0.5',
                  isLast ? 'font-semibold text-[#0A1629]' : 'text-[#64748B]',
                )}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
