import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  CheckCheck,
  CreditCard,
  FileText,
  Shield,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { LoadingBlock, EmptyState } from '@/components/ui/primitives';
import {
  notificationsApi,
  notificationsQueryKeys,
  type CitizenNotification,
} from '@/services/api/notifications.api';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

type FilterTab = 'all' | 'unread' | 'applications' | 'documents' | 'security';

function notificationIcon(item: CitizenNotification) {
  const title = item.title.toLowerCase();
  if (title.includes('payment') || title.includes('fee')) return CreditCard;
  if (title.includes('security') || title.includes('login')) return Shield;
  if (title.includes('document')) return FileText;
  return Bell;
}

function matchesFilter(item: CitizenNotification, filter: FilterTab): boolean {
  if (filter === 'all') return true;
  if (filter === 'unread') return !item.readAt;
  const text = `${item.title} ${item.body}`.toLowerCase();
  if (filter === 'applications') return text.includes('application') || Boolean(item.metadata?.applicationId);
  if (filter === 'documents') return text.includes('document');
  if (filter === 'security') return text.includes('security') || text.includes('login');
  return true;
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<FilterTab>('all');

  const { data, isLoading, isError } = useQuery({
    queryKey: notificationsQueryKeys.list(page),
    queryFn: () => notificationsApi.listNotifications(page, 15),
    staleTime: 0,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markNotificationRead(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.all }),
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationsApi.markAllNotificationsRead(),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.all }),
  });

  const items = data?.data ?? [];
  const filtered = useMemo(() => items.filter(i => matchesFilter(i, filter)), [items, filter]);
  const unreadCount = items.filter(n => !n.readAt).length;
  const totalPages = data?.meta?.totalPages ?? 1;

  function openNotification(item: CitizenNotification) {
    if (!item.readAt) markRead.mutate(item.id);
    const ticketId = item.metadata?.ticketId;
    if (typeof ticketId === 'string') {
      navigate(`/help/tickets/${ticketId}`);
      return;
    }
    const applicationId = item.metadata?.applicationId;
    navigate(typeof applicationId === 'string' ? `/applications/${applicationId}` : '/applications');
  }

  const tabs: Array<{ id: FilterTab; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: `Unread${unreadCount ? ` (${unreadCount})` : ''}` },
    { id: 'applications', label: 'Applications' },
    { id: 'documents', label: 'Documents' },
    { id: 'security', label: 'Security' },
  ];

  return (
    <div className="space-y-6 pb-8">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'My Account', to: '/profile' },
          { label: 'Notifications' },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-bold text-[#0A1629]">Notifications</h1>
          {unreadCount > 0 ? (
            <span className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-bold text-[#2563EB]">
              {unreadCount} Unread
            </span>
          ) : null}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={unreadCount === 0 || markAllRead.isPending}
          onClick={() => markAllRead.mutate()}
        >
          <CheckCheck className="mr-2 h-4 w-4" />
          Mark All as Read
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-[#E8EDF5] pb-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={cn(
              'rounded-lg px-3 py-2 text-sm font-medium transition',
              filter === tab.id
                ? 'bg-[#EFF6FF] text-[#2563EB]'
                : 'text-[#64748B] hover:bg-[#F8FAFC]',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingBlock className="h-64" />
      ) : isError ? (
        <EmptyState title="Could not load notifications" description="Please try again." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="Updates about applications, documents, and support will appear here."
        />
      ) : (
        <ul className="space-y-3">
          {filtered.map(item => {
            const Icon = notificationIcon(item);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => openNotification(item)}
                  className={cn(
                    'flex w-full gap-4 rounded-2xl border border-[#E8EDF5] bg-white p-4 text-left shadow-sm transition hover:border-[#2563EB]/30',
                    !item.readAt && 'border-[#BFDBFE] bg-[#F8FAFC]',
                  )}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <p className="font-semibold text-[#0A1629]">{item.title}</p>
                      {!item.readAt ? (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#EF4444]" />
                      ) : null}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#64748B]">{item.body}</p>
                    <p className="mt-2 text-xs text-[#94A3B8]">{formatDate(item.createdAt)}</p>
                  </div>
                  <span className="hidden shrink-0 self-center text-sm font-semibold text-[#2563EB] sm:inline">
                    View details
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-[#64748B]">
            Page {page} of {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
