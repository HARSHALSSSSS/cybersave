import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Circle,
  Download,
  FileText,
  User,
  Wallet,
} from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Textarea,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate } from '@/utils/format';
import {
  addApplicationNote,
  assignApplicationOperator,
  executeApplicationTransition,
  getApplicationById,
  getApplicationDocumentDownload,
  getAvailableTransitions,
  requestCorrection,
} from '../services/applications.service';
import { getOperators } from '@/features/operators/services/operators.service';
import { ApplicationStatusBadge } from '../components/ApplicationStatusBadge';

type PendingTransition = {
  actionKey: string;
  label: string;
  requiresComment?: boolean;
  createsActionRequest?: boolean;
};

type ActionDialogMode = 'transition' | 'request-correction';

export function ApplicationDetailPage() {
  const { applicationId = '' } = useParams<{ applicationId: string }>();
  const [noteDraft, setNoteDraft] = useState('');
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionDialogMode, setActionDialogMode] = useState<ActionDialogMode>('transition');
  const [pendingTransition, setPendingTransition] = useState<PendingTransition | null>(null);
  const [comment, setComment] = useState('');
  const [instructions, setInstructions] = useState('');
  const [requiredFieldKeysInput, setRequiredFieldKeysInput] = useState('');
  const [requiredDocumentIdsInput, setRequiredDocumentIdsInput] = useState('');
  const queryClient = useQueryClient();

  const { data: application, isLoading } = useQuery({
    queryKey: ['applications', 'detail', applicationId],
    queryFn: () => getApplicationById(applicationId),
  });

  const { data: transitionsData } = useQuery({
    queryKey: ['applications', 'transitions', applicationId],
    queryFn: () => getAvailableTransitions(applicationId),
    enabled: Boolean(applicationId),
  });

  const noteMutation = useMutation({
    mutationFn: (content: string) => addApplicationNote(applicationId, content),
    onSuccess: () => {
      toast.success('Note added');
      setNoteDraft('');
      queryClient.invalidateQueries({ queryKey: ['applications', 'detail', applicationId] });
    },
    onError: () => toast.error('Failed to add note'),
  });

  const transitionMutation = useMutation({
    mutationFn: (payload: {
      actionKey: string;
      comment?: string;
      instructions?: string;
      requiredFieldKeys?: string[];
      requiredDocumentIds?: string[];
    }) =>
      executeApplicationTransition(applicationId, payload.actionKey, {
        comment: payload.comment,
        instructions: payload.instructions,
        requiredFieldKeys: payload.requiredFieldKeys,
        requiredDocumentIds: payload.requiredDocumentIds,
      }),
    onSuccess: () => {
      toast.success('Application updated');
      closeActionDialog();
      queryClient.invalidateQueries({ queryKey: ['applications', 'detail', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['applications', 'transitions', applicationId] });
    },
    onError: () => toast.error('Transition failed'),
  });

  const correctionMutation = useMutation({
    mutationFn: (payload: {
      reason: string;
      instructions?: string;
      requiredFieldKeys?: string[];
      requiredDocumentIds?: string[];
    }) => requestCorrection(applicationId, payload),
    onSuccess: () => {
      toast.success('Correction requested');
      closeActionDialog();
      queryClient.invalidateQueries({ queryKey: ['applications', 'detail', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['applications', 'transitions', applicationId] });
    },
    onError: () => toast.error('Failed to request correction'),
  });

  const downloadMutation = useMutation({
    mutationFn: (documentId: string) =>
      getApplicationDocumentDownload(applicationId, documentId),
    onSuccess: (data) => {
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank', 'noopener,noreferrer');
      } else {
        toast.error('Download URL unavailable');
      }
    },
    onError: () => toast.error('Failed to download document'),
  });

  const { data: operatorsResult } = useQuery({
    queryKey: ['operators', 'assign-list'],
    queryFn: () => getOperators({ page: 1, pageSize: 50 }),
  });

  const assignMutation = useMutation({
    mutationFn: (operatorId: string) =>
      assignApplicationOperator(applicationId, operatorId),
    onSuccess: () => {
      toast.success('Operator assigned');
      queryClient.invalidateQueries({ queryKey: ['applications', 'detail', applicationId] });
    },
    onError: () => toast.error('Failed to assign operator'),
  });

  const transitions = transitionsData?.transitions ?? [];

  const isCorrectionDialog =
    actionDialogMode === 'request-correction' || Boolean(pendingTransition?.createsActionRequest);

  const selectedFieldKeys = useMemo(
    () =>
      requiredFieldKeysInput
        .split(',')
        .map((key) => key.trim())
        .filter(Boolean),
    [requiredFieldKeysInput],
  );

  const selectedDocumentIds = useMemo(
    () =>
      requiredDocumentIdsInput
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean),
    [requiredDocumentIdsInput],
  );

  function closeActionDialog() {
    setActionDialogOpen(false);
    setPendingTransition(null);
    setComment('');
    setInstructions('');
    setRequiredFieldKeysInput('');
    setRequiredDocumentIdsInput('');
  }

  function openTransitionDialog(transition: PendingTransition) {
    setActionDialogMode('transition');
    setPendingTransition(transition);
    setComment('');
    setInstructions('');
    setRequiredFieldKeysInput('');
    setRequiredDocumentIdsInput('');
    setActionDialogOpen(true);
  }

  function openRequestCorrectionDialog() {
    setActionDialogMode('request-correction');
    setPendingTransition(null);
    setComment('');
    setInstructions('');
    setRequiredFieldKeysInput('');
    setRequiredDocumentIdsInput('');
    setActionDialogOpen(true);
  }

  function handleTransitionClick(transition: PendingTransition) {
    if (transition.requiresComment || transition.createsActionRequest) {
      openTransitionDialog(transition);
      return;
    }
    transitionMutation.mutate({ actionKey: transition.actionKey });
  }

  function submitActionDialog() {
    const trimmedComment = comment.trim();
    if (!trimmedComment) {
      toast.error('Comment is required');
      return;
    }

    if (actionDialogMode === 'request-correction') {
      correctionMutation.mutate({
        reason: trimmedComment,
        instructions: instructions.trim() || undefined,
        requiredFieldKeys: selectedFieldKeys.length > 0 ? selectedFieldKeys : undefined,
        requiredDocumentIds: selectedDocumentIds.length > 0 ? selectedDocumentIds : undefined,
      });
      return;
    }

    if (!pendingTransition) return;

    transitionMutation.mutate({
      actionKey: pendingTransition.actionKey,
      comment: trimmedComment,
      instructions: isCorrectionDialog ? instructions.trim() || undefined : undefined,
      requiredFieldKeys:
        isCorrectionDialog && selectedFieldKeys.length > 0 ? selectedFieldKeys : undefined,
      requiredDocumentIds:
        isCorrectionDialog && selectedDocumentIds.length > 0 ? selectedDocumentIds : undefined,
    });
  }

  const actionPending = transitionMutation.isPending || correctionMutation.isPending;

  if (isLoading || !application) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  const slaPercent = Math.max(
    0,
    Math.min(100, Math.round(((application.slaHours - application.slaRemainingHours) / application.slaHours) * 100)),
  );
  const completedChecklist = application.checklist.filter((item) => item.completed).length;
  const checklistPercent = Math.round((completedChecklist / application.checklist.length) * 100);

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
              <Link to="/applications">Applications</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{application.id}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="border-gray-200">
        <CardContent className="space-y-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">{application.id}</h1>
                <ApplicationStatusBadge status={application.status} />
                <Badge variant="outline" className="border-red-100 bg-red-50 text-red-700">
                  {application.priority === 'high' ? 'High Priority' : application.priority === 'medium' ? 'Medium Priority' : 'Low Priority'}
                </Badge>
              </div>
              <p className="mt-1.5 text-lg font-medium text-gray-700">{application.service}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {operatorsResult?.data?.length ? (
                <Select
                  onValueChange={(operatorId) => assignMutation.mutate(operatorId)}
                >
                  <SelectTrigger className="h-9 w-[180px]">
                    <SelectValue placeholder="Assign operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {operatorsResult.data.map((op) => (
                      <SelectItem key={op.id} value={op.id}>
                        {op.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
              {transitions.map((transition) => (
                <Button
                  key={transition.actionKey}
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  disabled={actionPending}
                  onClick={() => handleTransitionClick(transition)}
                >
                  {transition.label}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-amber-200 text-amber-800 hover:bg-amber-50"
                disabled={actionPending}
                onClick={openRequestCorrectionDialog}
              >
                Request Correction
              </Button>
              {transitions.length === 0 ? (
                <span className="text-sm text-muted-foreground">Use Request Correction or wait for workflow actions</span>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-600">SLA Progress</span>
              <span className={cn('font-medium', application.slaRemainingHours <= 6 ? 'text-red-600' : 'text-gray-500')}>
                {application.status === 'completed' ? 'SLA Met' : `${application.slaRemainingHours}h remaining`}
              </span>
            </div>
            <Progress value={slaPercent} className="h-2" />
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-3">
            <MetaField icon={Calendar} label="Submitted" value={formatDate(application.submittedAt, 'DD MMM YYYY, hh:mm A')} />
            <MetaField icon={User} label="Assigned Operator" value={application.assignedOperator ?? 'Unassigned'} />
            <MetaField icon={Building2} label="Centre" value={application.centre} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base font-semibold text-gray-900">Applicant Details</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/users/${application.citizenId}`}>View Profile</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11">
                  <AvatarFallback className="bg-blue-100 text-sm font-semibold text-[#2563EB]">
                    {application.citizenInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{application.citizenName}</p>
                  <p className="text-xs text-gray-500">{application.citizenId}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-900">Application Form</CardTitle>
            </CardHeader>
            <CardContent>
              {application.formFields.length > 0 ? (
                <dl className="divide-y divide-gray-100">
                  {application.formFields.map((field) => (
                    <div key={field.key} className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">{field.label}</dt>
                      <dd className="text-sm text-gray-900 sm:col-span-2 break-words">{field.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-sm text-muted-foreground">No form data submitted yet.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-900">Supporting Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {application.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
                      <FileText className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        doc.status === 'verified'
                          ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                          : doc.status === 'pending'
                            ? 'border-amber-100 bg-amber-50 text-amber-700'
                            : 'border-red-100 bg-red-50 text-red-700'
                      }
                    >
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      disabled={downloadMutation.isPending}
                      onClick={() => downloadMutation.mutate(doc.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-900">Verification Checklist</CardTitle>
              <p className="text-sm leading-5 text-muted-foreground">
                {completedChecklist} of {application.checklist.length} steps completed
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={checklistPercent} className="h-2" />
              <ul className="space-y-2.5">
                {application.checklist.map((item) => (
                  <li key={item.id} className="flex items-center gap-2.5 text-sm">
                    {item.completed ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-gray-300" />
                    )}
                    <span className={item.completed ? 'text-gray-700' : 'text-gray-400'}>{item.label}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-900">Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-gray-500">
                  <Wallet className="h-4 w-4 text-gray-400" />
                  Amount
                </span>
                <span className="text-sm font-semibold text-gray-900">{formatCurrency(application.payment.amount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <Badge
                  variant="outline"
                  className={
                    application.payment.status === 'paid'
                      ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                      : application.payment.status === 'pending'
                        ? 'border-amber-100 bg-amber-50 text-amber-700'
                        : 'border-red-100 bg-red-50 text-red-700'
                  }
                >
                  {application.payment.status.charAt(0).toUpperCase() + application.payment.status.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Method</span>
                <span className="text-sm text-gray-700">{application.payment.method}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Transaction ID</span>
                <span className="text-sm text-gray-700">{application.payment.transactionId}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-900">Application Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="relative space-y-5 border-l border-gray-100 pl-6">
                {application.timeline.map((event) => (
                  <li key={event.id} className="relative">
                    <span
                      className={cn(
                        'absolute -left-[29px] flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-white',
                        event.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400',
                      )}
                    >
                      {event.completed ? <Check className="h-3 w-3" /> : <Circle className="h-2 w-2" />}
                    </span>
                    <p className={cn('text-sm font-medium', event.completed ? 'text-gray-900' : 'text-gray-400')}>
                      {event.title}
                    </p>
                    {event.description ? <p className="mt-0.5 text-xs text-gray-500">{event.description}</p> : null}
                    {event.timestamp ? (
                      <p className="mt-1 text-xs text-gray-400">
                        {formatDate(event.timestamp, 'DD MMM, hh:mm A')} · {event.actor}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-900">Internal Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {application.notes.map((note) => (
                <div key={note.id} className="rounded-xl border border-gray-100 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{note.author}</p>
                    <p className="text-xs text-gray-400">{formatDate(note.createdAt, 'DD MMM, hh:mm A')}</p>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{note.content}</p>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Add an internal note…"
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && noteDraft.trim()) {
                      noteMutation.mutate(noteDraft.trim());
                    }
                  }}
                />
                <Button
                  size="sm"
                  disabled={!noteDraft.trim() || noteMutation.isPending}
                  onClick={() => noteMutation.mutate(noteDraft.trim())}
                >
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={actionDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeActionDialog();
          else setActionDialogOpen(true);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-gray-900">
              {actionDialogMode === 'request-correction'
                ? 'Request Correction'
                : pendingTransition?.label ?? 'Confirm action'}
            </DialogTitle>
            <DialogDescription>
              {isCorrectionDialog
                ? 'Tell the citizen what needs to be corrected. A comment is required.'
                : 'A comment is required before continuing.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="action-comment">Comment</Label>
              <Textarea
                id="action-comment"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Explain the decision or required changes…"
              />
            </div>

            {isCorrectionDialog ? (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="action-instructions">Instructions (optional)</Label>
                  <Textarea
                    id="action-instructions"
                    rows={3}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Extra guidance for the citizen…"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="action-field-keys">Required field keys (optional)</Label>
                  {application.formFieldKeys.length > 0 ? (
                    <Select
                      onValueChange={(value) => {
                        const next = new Set(selectedFieldKeys);
                        next.add(value);
                        setRequiredFieldKeysInput([...next].join(', '));
                      }}
                    >
                      <SelectTrigger id="action-field-keys">
                        <SelectValue placeholder="Add a form field key" />
                      </SelectTrigger>
                      <SelectContent>
                        {application.formFieldKeys.map((key) => (
                          <SelectItem key={key} value={key}>
                            {key}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null}
                  <Input
                    className="mt-2"
                    value={requiredFieldKeysInput}
                    onChange={(e) => setRequiredFieldKeysInput(e.target.value)}
                    placeholder="e.g. fullName, address, aadhaarNumber"
                  />
                  <p className="text-xs text-muted-foreground">Comma-separated field keys</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="action-document-ids">Required document IDs (optional)</Label>
                  {application.documentRequirementOptions.length > 0 ? (
                    <Select
                      onValueChange={(value) => {
                        const next = new Set(selectedDocumentIds);
                        next.add(value);
                        setRequiredDocumentIdsInput([...next].join(', '));
                      }}
                    >
                      <SelectTrigger id="action-document-ids">
                        <SelectValue placeholder="Add a document requirement" />
                      </SelectTrigger>
                      <SelectContent>
                        {application.documentRequirementOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null}
                  <Input
                    className="mt-2"
                    value={requiredDocumentIdsInput}
                    onChange={(e) => setRequiredDocumentIdsInput(e.target.value)}
                    placeholder="Comma-separated document requirement IDs"
                  />
                  <p className="text-xs text-muted-foreground">Comma-separated document requirement IDs</p>
                </div>
              </>
            ) : null}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={closeActionDialog} disabled={actionPending}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!comment.trim() || actionPending}
              onClick={submitActionDialog}
              className="bg-[#2563EB] hover:bg-blue-700"
            >
              {actionPending ? 'Submitting…' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MetaField({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}
