import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import {
  notificationsApi,
  notificationsQueryKeys,
} from '@/services/api/notifications.api';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: notificationsQueryKeys.list(1),
    queryFn: () => notificationsApi.listNotifications(1, 8),
    refetchInterval: 30_000,
  });

  const items = data?.data ?? [];
  const unread = items.filter(n => !n.readAt).length;

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markNotificationRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.all });
    },
  });

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="relative rounded-lg p-2.5 text-[#64748B] transition hover:bg-[#F1F5F9]"
        aria-label="Notifications"
        onClick={() => setOpen(v => !v)}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 ? (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#EF4444] ring-2 ring-white" />
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-[#E8EDF5] bg-white shadow-xl sm:w-96">
          <div className="flex items-center justify-between border-b border-[#E8EDF5] px-4 py-3">
            <p className="text-sm font-semibold text-[#0A1629]">Notifications</p>
            {unread > 0 ? (
              <span className="rounded-full bg-[#FEF2F2] px-2 py-0.5 text-[10px] font-bold text-[#DC2626]">
                {unread} new
              </span>
            ) : null}
          </div>
          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[#64748B]">No notifications yet.</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {items.map(item => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={cn(
                      'w-full px-4 py-3 text-left hover:bg-[#F8FAFC]',
                      !item.readAt && 'bg-[#EFF6FF]/50',
                    )}
                    onClick={() => {
                      if (!item.readAt) markRead.mutate(item.id);
                      setOpen(false);
                      const ticketId = item.metadata?.ticketId;
                      if (typeof ticketId === 'string') {
                        navigate(`/help/tickets/${ticketId}`);
                        return;
                      }
                      const applicationId = item.metadata?.applicationId;
                      navigate(
                        typeof applicationId === 'string'
                          ? `/applications/${applicationId}`
                          : '/applications',
                      );
                    }}
                  >
                    <p className="text-sm font-semibold text-[#0A1629]">{item.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#64748B]">{item.body}</p>
                    <p className="mt-1 text-[10px] text-[#94A3B8]">{formatDate(item.createdAt)}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-[#E8EDF5] px-4 py-2.5">
            <Link
              to="/notifications"
              className="block text-center text-sm font-semibold text-[#2563EB] hover:underline"
              onClick={() => setOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
