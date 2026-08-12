import dayjs from 'dayjs';
import { Activity } from 'lucide-react';
import type { CitizenActivity } from '../types';

export function ActivityTimeline({ items }: { items: CitizenActivity[] }) {
  return (
    <ol className="relative space-y-6 border-l border-gray-100 pl-6">
      {items.map((item) => (
        <li key={item.id} className="relative">
          <span className="absolute -left-[29px] flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-[#2563EB] ring-4 ring-white">
            <Activity className="h-3 w-3" />
          </span>
          <p className="text-sm font-medium text-gray-900">{item.action}</p>
          <p className="text-sm leading-5 text-muted-foreground">{item.description}</p>
          <p className="mt-1 text-xs text-gray-400">{dayjs(item.timestamp).format('DD MMM YYYY, hh:mm A')}</p>
        </li>
      ))}
    </ol>
  );
}
