import { Link } from 'react-router';
import { Button, Card, CardContent } from '@/components/ui';
import { formatDate } from '@/utils/format';
import type { TicketSummary } from '../types';
import { TicketStatusBadge } from './TicketStatusBadge';
import { TicketPriorityLabel } from './TicketPriorityLabel';

export function TicketCard({ ticket }: { ticket: TicketSummary }) {
  return (
    <Card className="flex h-full flex-col border-border">
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-muted-foreground">{ticket.id}</span>
          <TicketStatusBadge status={ticket.status} />
        </div>

        <h3 className="text-sm leading-5 font-semibold text-foreground">{ticket.subject}</h3>

        <div className="flex flex-1 flex-col gap-2 border-t border-border-subtle pt-3 text-sm leading-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Category</span>
            <span className="font-medium text-foreground">{ticket.category}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Priority</span>
            <TicketPriorityLabel priority={ticket.priority} />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Created On</span>
            <span className="font-medium text-foreground">{formatDate(ticket.createdAt)}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Last Updated</span>
            <span className="font-medium text-foreground">{formatDate(ticket.updatedAt)}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Assigned To</span>
            <span className="font-medium text-foreground">{ticket.assignedTo ?? 'Unassigned'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link to={`/support-tickets/${ticket.id}`}>View</Link>
          </Button>
          <Button size="sm" className="flex-1 bg-primary hover:bg-primary-hover" asChild>
            <Link to={`/support-tickets/${ticket.id}`}>Respond</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
