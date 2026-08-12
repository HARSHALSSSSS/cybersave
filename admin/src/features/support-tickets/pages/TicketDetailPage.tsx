import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Paperclip, UserCog } from 'lucide-react';
import { toast } from 'sonner';
import {
  Avatar,
  AvatarFallback,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  Textarea,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/format';
import { getTicketByParam } from '../services/tickets.service';
import { TicketStatusBadge } from '../components/TicketStatusBadge';
import type { TicketInternalNote } from '../types';

export function TicketDetailPage() {
  const { ticketId = '' } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const [reply, setReply] = useState('');
  const [noteDraft, setNoteDraft] = useState('');
  const [extraNotes, setExtraNotes] = useState<TicketInternalNote[]>([]);

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['support-tickets', 'detail', ticketId],
    queryFn: () => getTicketByParam(ticketId),
  });

  if (isLoading || !ticket) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 w-full rounded-2xl lg:col-span-2" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  function handleSendReply() {
    if (!reply.trim()) return;
    toast.success('Reply sent to reporter');
    setReply('');
  }

  function handleSaveDraft() {
    toast.info('Draft saved');
  }

  function handleAddNote() {
    if (!noteDraft.trim() || !ticket) return;
    setExtraNotes((prev) => [
      ...prev,
      {
        id: `local-${prev.length + 1}`,
        author: 'You',
        authorInitials: 'YO',
        content: noteDraft.trim(),
        createdAt: new Date().toISOString(),
      },
    ]);
    setNoteDraft('');
    toast.success('Private note added');
  }

  const allNotes = [...ticket.internalNotes, ...extraNotes];

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/support-tickets">Support Tickets</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Ticket #{ticket.shortId}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl leading-8 font-semibold tracking-tight text-foreground">{ticket.subject}</h1>
          <TicketStatusBadge status={ticket.status} />
        </div>
        <p className="text-sm leading-5 text-muted-foreground">{ticket.description}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Conversation Thread</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {ticket.messages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback
                      className={cn(
                        'text-xs font-semibold',
                        message.role === 'agent' ? 'bg-accent text-accent-foreground' : 'bg-muted text-foreground',
                      )}
                    >
                      {message.authorInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{message.author}</span>
                      <Badge variant={message.role === 'agent' ? 'info' : 'muted'}>
                        {message.role === 'agent' ? 'Agent' : 'Customer'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(message.timestamp, 'DD MMM YYYY, hh:mm A')}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm leading-5 text-foreground/90">{message.body}</p>
                  </div>
                </div>
              ))}

              <div className="space-y-2.5 border-t border-border-subtle pt-4">
                <p className="text-sm font-medium text-foreground">Write a Response</p>
                <Textarea
                  rows={4}
                  placeholder="Type your response to the reporter..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    onClick={() => toast.info('Attachment picker coming soon')}
                  >
                    <Paperclip className="h-3.5 w-3.5" />
                    Attach file
                  </button>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleSaveDraft}>
                      Save Draft
                    </Button>
                    <Button size="sm" disabled={!reply.trim()} onClick={handleSendReply}>
                      Send Reply
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm leading-5">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Ticket ID</span>
                  <span className="font-medium text-foreground">{ticket.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium text-foreground">{ticket.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Priority</span>
                  <Badge variant={ticket.priority === 'low' ? 'muted' : ticket.priority === 'medium' ? 'warning' : 'danger'}>
                    {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium text-foreground">{formatDate(ticket.createdAt, 'DD MMM YYYY, hh:mm A')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Updated</span>
                  <span className="font-medium text-foreground">{formatDate(ticket.updatedAt, 'DD MMM YYYY, hh:mm A')}</span>
                </div>
              </div>

              <div className="space-y-3 border-t border-border-subtle pt-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">Assigned To</span>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">
                        {ticket.assignedToInitials ?? '—'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground">{ticket.assignedTo ?? 'Unassigned'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">Reporter</span>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-muted text-xs font-semibold text-foreground">
                        {ticket.reporterInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground">{ticket.reporterName}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-border-subtle pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-center gap-1.5 border-danger-border bg-danger-bg text-danger-text hover:bg-danger-bg/80"
                  onClick={() => toast.success(`${ticket.id} escalated`)}
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Escalate Ticket
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-center gap-1.5 border-success-border bg-success-bg text-success-text hover:bg-success-bg/80"
                  onClick={() => navigate(`/support-tickets/${ticketId}/resolve`)}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Mark as Resolved
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-center gap-1.5"
                  onClick={() => toast.info('Reassign flow coming soon')}
                >
                  <UserCog className="h-3.5 w-3.5" />
                  Reassign Ticket
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Internal Team Notes &amp; Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {allNotes.map((note) => (
            <div key={note.id} className="rounded-xl border border-warning-border bg-warning-bg p-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">{note.author}</span>
                <span className="text-xs text-muted-foreground">{formatDate(note.createdAt, 'DD MMM, hh:mm A')}</span>
              </div>
              <p className="mt-1 text-sm leading-5 text-foreground/90">{note.content}</p>
            </div>
          ))}

          <div className="flex items-center gap-2 pt-1">
            <Textarea
              rows={2}
              placeholder="Add a private note visible only to the team..."
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              className="flex-1"
            />
          </div>
          <Button variant="outline" size="sm" disabled={!noteDraft.trim()} onClick={handleAddNote}>
            + Add Private Note
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
