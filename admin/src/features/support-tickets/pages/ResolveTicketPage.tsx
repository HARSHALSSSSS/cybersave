import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Mail, Star, X } from 'lucide-react';
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
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Switch,
  Textarea,
} from '@/components/ui';
import { formatDate } from '@/utils/format';
import { DEFAULT_INTERNAL_TAGS, RESOLUTION_CATEGORIES, ROOT_CAUSES } from '../constants/mock-data';
import { getTicketByParam, resolveTicket } from '../services/tickets.service';
import { resolveTicketSchema, type ResolveTicketFormValues } from '../schemas/resolve-ticket.schema';
import { TicketStatusBadge } from '../components/TicketStatusBadge';
import type { TicketDetail } from '../types';

export function ResolveTicketPage() {
  const { ticketId = '' } = useParams<{ ticketId: string }>();

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['support-tickets', 'detail', ticketId],
    queryFn: () => getTicketByParam(ticketId),
  });

  if (isLoading || !ticket) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-[560px] w-full rounded-2xl lg:col-span-2" />
          <Skeleton className="h-[560px] w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return <ResolveTicketForm ticket={ticket} ticketParam={ticketId} />;
}

function ResolveTicketForm({ ticket, ticketParam }: { ticket: TicketDetail; ticketParam: string }) {
  const navigate = useNavigate();
  const [tags, setTags] = useState<string[]>(DEFAULT_INTERNAL_TAGS);
  const [tagDraft, setTagDraft] = useState('');

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResolveTicketFormValues>({
    resolver: zodResolver(resolveTicketSchema),
    defaultValues: {
      resolutionSummary:
        'Identified intermittent connection pool exhaustion on the Google OAuth proxy layer causing 502 errors during authentication. Applied a configuration fix and verified the login flow is stable across affected accounts.',
      resolutionCategory: 'Bug Fix',
      rootCause: 'Third-Party Service Outage',
      resolutionDays: 2,
      resolutionHours: 4,
      tags,
      notifyReporter: true,
      satisfactionSurvey: true,
    },
  });

  const notifyReporter = watch('notifyReporter');
  const resolutionSummary = watch('resolutionSummary');

  const { mutateAsync } = useMutation({
    mutationFn: (values: ResolveTicketFormValues) => resolveTicket(ticketParam, values),
  });

  function addTag() {
    const value = tagDraft.trim();
    if (!value || tags.includes(value)) {
      setTagDraft('');
      return;
    }
    setTags((prev) => [...prev, value]);
    setTagDraft('');
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  const onSubmit = handleSubmit(async (values) => {
    await mutateAsync({ ...values, tags });
    toast.success(`${ticket.id} marked as resolved`);
    navigate(`/support-tickets/${ticketParam}`);
  });

  function handleSaveDraft() {
    toast.info('Resolution saved as draft');
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
            <BreadcrumbLink asChild>
              <Link to={`/support-tickets/${ticketParam}`}>Ticket #{ticket.shortId}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Resolution</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-wrap items-center gap-2.5">
        <h1 className="text-2xl leading-8 font-semibold tracking-tight text-foreground">
          Resolve Ticket #{ticket.shortId}
        </h1>
        <TicketStatusBadge status={ticket.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Resolution Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="resolution-summary">Resolution Summary</Label>
                <Textarea id="resolution-summary" rows={5} {...register('resolutionSummary')} />
                {errors.resolutionSummary ? (
                  <p className="text-xs text-danger-text">{errors.resolutionSummary.message}</p>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="resolution-category">Resolution Category</Label>
                  <Controller
                    control={control}
                    name="resolutionCategory"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="resolution-category" className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {RESOLUTION_CATEGORIES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="root-cause">Root Cause</Label>
                  <Controller
                    control={control}
                    name="rootCause"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="root-cause" className="w-full">
                          <SelectValue placeholder="Select root cause" />
                        </SelectTrigger>
                        <SelectContent>
                          {ROOT_CAUSES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Time to Resolution</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" min={0} className="w-24" {...register('resolutionDays')} />
                    <span className="text-sm text-muted-foreground">days</span>
                    <Input type="number" min={0} max={23} className="w-24" {...register('resolutionHours')} />
                    <span className="text-sm text-muted-foreground">hours</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Internal Tags</Label>
                <div className="flex flex-wrap items-center gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1 pr-1.5">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                        aria-label={`Remove ${tag}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  <Input
                    value={tagDraft}
                    onChange={(e) => setTagDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Add tag…"
                    className="h-7 w-28 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-3 border-t border-border-subtle pt-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Notify Reporter via Email</p>
                    <p className="text-xs leading-4 text-muted-foreground">
                      Send the reporter a summary of this resolution.
                    </p>
                  </div>
                  <Controller
                    control={control}
                    name="notifyReporter"
                    render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Customer Satisfaction Survey</p>
                    <p className="text-xs leading-4 text-muted-foreground">
                      Include a short satisfaction survey link in the notification.
                    </p>
                  </div>
                  <Controller
                    control={control}
                    name="satisfactionSurvey"
                    render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-border-subtle pt-4">
                <Button type="submit" disabled={isSubmitting} className="gap-1.5">
                  {isSubmitting ? 'Confirming…' : 'Confirm Resolution'}
                </Button>
                <Button type="button" variant="outline" onClick={handleSaveDraft}>
                  Save as Draft
                </Button>
                <Button type="button" variant="ghost" onClick={() => navigate(`/support-tickets/${ticketParam}`)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Ticket Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-5">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ticket ID</span>
                <span className="font-medium text-foreground">{ticket.id}</span>
              </div>
              <p className="font-medium text-foreground">{ticket.subject}</p>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium text-foreground">{ticket.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium text-foreground">{formatDate(ticket.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Reporter</span>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-muted text-[10px] font-semibold text-foreground">
                      {ticket.reporterInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground">{ticket.reporterName}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {notifyReporter ? (
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Notification Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border border-border-subtle bg-muted/40 p-4">
                  <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
                      <Mail className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Your ticket has been resolved</p>
                      <p className="text-xs text-muted-foreground">to: {ticket.reporterEmail}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-5 text-foreground/90">
                    Hi {ticket.reporterName.split(' ')[0]}, your ticket {ticket.id} — "{ticket.subject}" has been
                    resolved.
                  </p>
                  <p className="mt-2 line-clamp-3 text-xs leading-5 text-muted-foreground">{resolutionSummary}</p>
                  {watch('satisfactionSurvey') ? (
                    <div className="mt-3 flex items-center gap-1 border-t border-border-subtle pt-3">
                      <span className="text-xs text-muted-foreground">How was your experience?</span>
                      <div className="ml-auto flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-warning text-warning" />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </form>
  );
}
