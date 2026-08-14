import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { MessageSquarePlus } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { LoadingBlock, EmptyState } from '@/components/ui/primitives';
import { supportApi, supportQueryKeys } from '@/services/api';
import { formatDate } from '@/lib/utils';

function statusLabel(status: string) {
  return status.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

function statusTone(status: string) {
  if (status === 'RESOLVED' || status === 'CLOSED') return 'text-emerald-700 bg-emerald-50';
  if (status === 'IN_PROGRESS') return 'text-blue-700 bg-blue-50';
  return 'text-amber-700 bg-amber-50';
}

export function HelpTicketsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: supportQueryKeys.tickets(1),
    queryFn: () => supportApi.listTickets(1, 50),
    staleTime: 0,
  });

  const tickets = data?.data ?? [];

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Portal Home', to: '/' },
          { label: 'Help & Support', to: '/help' },
          { label: 'My Tickets' },
        ]}
      />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#0A1629]">My Support Tickets</h1>
          <p className="mt-2 text-sm text-[#64748B]">
            Track replies from Cybersave support and continue the conversation.
          </p>
        </div>
        <Link to="/help">
          <Button>
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            Raise a Ticket
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <LoadingBlock className="h-48" />
      ) : isError ? (
        <EmptyState title="Could not load tickets" description="Please try again in a moment." />
      ) : tickets.length === 0 ? (
        <EmptyState
          title="No tickets yet"
          description="Raise a ticket from Help & Support if you need assistance."
        />
      ) : (
        <ul className="space-y-3">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <Link
                to={`/help/tickets/${ticket.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4 shadow-sm transition hover:border-[#2563EB]/30"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#0A1629]">{ticket.subject}</p>
                  <p className="mt-1 text-xs text-[#94A3B8]">
                    Updated {formatDate(ticket.updatedAt)}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${statusTone(ticket.status)}`}
                >
                  {statusLabel(ticket.status)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
