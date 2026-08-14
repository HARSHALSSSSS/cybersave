import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type BreadcrumbItem = {
  label: string;
  to?: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-1">
            {index > 0 ? <ChevronRight className="h-3.5 w-3.5 text-[#9CA3AF]" /> : null}
            {item.to && !isLast ? (
              <Link to={item.to} className="text-[#2563EB] hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className={cn(isLast ? 'font-medium text-[#2563EB]' : 'text-[#6B7280]')}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
