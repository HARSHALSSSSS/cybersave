import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { LoadingBlock, EmptyState } from '@/components/ui/primitives';
import { supportApi, supportQueryKeys } from '@/services/api';
import { formatDate, cn } from '@/lib/utils';

function statusLabel(status: string) {
  return status.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

export function HelpTicketDetailPage() {
  const { ticketId = '' } = useParams();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');

  const { data: ticket, isLoading, isError } = useQuery({
    queryKey: supportQueryKeys.ticket(ticketId),
    queryFn: () => supportApi.getTicket(ticketId),
    enabled: Boolean(ticketId),
    staleTime: 0,
  });

  const reply = useMutation({
    mutationFn: () => supportApi.addTicketMessage(ticketId, message.trim()),
    onSuccess: () => {
      toast.success('Reply sent');
      setMessage('');
      void queryClient.invalidateQueries({ queryKey: supportQueryKeys.ticket(ticketId) });
      void queryClient.invalidateQueries({ queryKey: supportQueryKeys.all });
    },
    onError: () => toast.error('Could not send reply'),
  });

  if (isLoading) return <LoadingBlock className="h-96" />;
  if (isError || !ticket) {
    return (
      <EmptyState title="Ticket not found" description="This support ticket may have been removed." />
    );
  }

  const closed = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED';
  const messages = ticket.messages ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Help & Support', to: '/help' },
          { label: 'My Tickets', to: '/help/tickets' },
          { label: ticket.subject },
        ]}
      />

      <Link
        to="/help/tickets"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to tickets
      </Link>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#0A1629]">{ticket.subject}</h1>
            <p className="mt-1 text-sm text-[#64748B]">
              Created {formatDate(ticket.createdAt)} · Updated {formatDate(ticket.updatedAt)}
            </p>
          </div>
          <span className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#2563EB]">
            {statusLabel(ticket.status)}
          </span>
        </div>

        <ul className="mt-6 space-y-4">
          {messages.length === 0 ? (
            <li className="text-sm text-[#94A3B8]">No messages yet.</li>
          ) : (
            messages.map((msg) => {
              const isCitizen = msg.senderType.toLowerCase() === 'citizen';
              return (
                <li
                  key={msg.id}
                  className={cn(
                    'rounded-xl border px-4 py-3',
                    isCitizen ? 'border-[#E5E7EB] bg-[#F8FAFC]' : 'border-blue-100 bg-[#EFF6FF]',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                      {isCitizen ? 'You' : 'Support'}
                    </p>
                    <p className="text-[11px] text-[#94A3B8]">{formatDate(msg.createdAt)}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#0A1629]">{msg.content}</p>
                </li>
              );
            })
          )}
        </ul>

        {closed ? (
          <p className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            This ticket is resolved. Raise a new ticket if you still need help.
          </p>
        ) : (
          <div className="mt-6 space-y-3 border-t border-[#F1F5F9] pt-5">
            <label htmlFor="ticket-reply" className="text-sm font-semibold text-[#0A1629]">
              Reply
            </label>
            <textarea
              id="ticket-reply"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your reply…"
              className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
            />
            <Button
              disabled={!message.trim() || reply.isPending}
              onClick={() => reply.mutate()}
            >
              {reply.isPending ? 'Sending…' : 'Send Reply'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
