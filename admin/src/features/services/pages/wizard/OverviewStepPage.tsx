import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Bold, Italic, List, Underline, X } from 'lucide-react';
import { toast } from 'sonner';
import {
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
  Textarea,
} from '@/components/ui';
import { ServiceWizardShell } from '../../wizard/ServiceWizardShell';
import { useSaveOverview, useServiceVersionBundle } from '../../wizard/useServiceVersion';

function TagInput({
  tags,
  onChange,
  tone = 'primary',
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  tone?: 'primary' | 'muted';
}) {
  const [value, setValue] = useState('');
  return (
    <div className="flex min-h-10 flex-wrap items-center gap-2 rounded-md border border-input bg-card px-3 py-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className={
            tone === 'primary'
              ? 'inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary'
              : 'inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground'
          }
        >
          {tag}
          <button type="button" onClick={() => onChange(tags.filter((t) => t !== tag))}>
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        className="min-w-[120px] flex-1 bg-transparent text-sm outline-none"
        placeholder="Add tag…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && value.trim()) {
            e.preventDefault();
            if (!tags.includes(value.trim())) onChange([...tags, value.trim()]);
            setValue('');
          }
        }}
      />
    </div>
  );
}

export function OverviewStepPage() {
  const { mainServiceId = '', subServiceId = '' } = useParams();
  const navigate = useNavigate();
  const base = `/services/new/${mainServiceId}/sub/${subServiceId}`;

  const { data: bundle, isLoading, isError } = useServiceVersionBundle(mainServiceId, subServiceId);
  const { mutateAsync: saveOverview, isPending } = useSaveOverview(mainServiceId, subServiceId);

  const [displayName, setDisplayName] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [detail, setDetail] = useState('');
  const [serviceType, setServiceType] = useState('online');
  const [tat, setTat] = useState('');
  const [department, setDepartment] = useState('');
  const [teamTags, setTeamTags] = useState<string[]>([]);
  const [seoTags, setSeoTags] = useState<string[]>([]);

  useEffect(() => {
    if (!bundle?.overview) return;
    const o = bundle.overview;
    setDisplayName(o.displayName ?? bundle.subService?.name ?? '');
    setShortDesc(o.shortDescription ?? '');
    setDetail(o.richDescription ?? '');
    setTat(o.processingTime ?? '');
    setDepartment(o.department ?? '');
    setSeoTags(o.seoTags ?? []);
  }, [bundle]);

  const mainServiceName = bundle?.subService?.mainService?.name ?? 'Main Service';

  const persist = async () => {
    await saveOverview({
      displayName: displayName.trim(),
      shortDescription: shortDesc.trim(),
      richDescription: detail.trim(),
      processingTime: tat.trim(),
      department: department.trim() || undefined,
      seoTags,
    });
  };

  const handleSave = async (next?: string) => {
    if (!displayName.trim() || !shortDesc.trim()) {
      toast.error('Display name and short description are required');
      return;
    }
    try {
      await persist();
      toast.success('Overview saved');
      if (next) navigate(next);
    } catch {
      toast.error('Failed to save overview');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-danger">Failed to load service version. Create a sub-service first.</p>;
  }

  return (
    <ServiceWizardShell
      step="overview"
      crumbs={[
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Services', to: '/services' },
        { label: mainServiceName, to: `/services/new/${mainServiceId}/sub-services` },
        { label: 'Overview' },
      ]}
      onDraft={() => handleSave()}
      onContinue={() => handleSave(`${base}/form-builder`)}
      continueLabel={isPending ? 'Saving…' : 'Save & Continue'}
    >
      <Card>
        <CardHeader>
          <CardTitle>Service Context & Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label>
              Display Name <span className="text-danger">*</span>
            </Label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>
              Short Description <span className="text-danger">*</span>
            </Label>
            <Input value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Detailed Description</Label>
            <div className="overflow-hidden rounded-md border border-input">
              <div className="flex items-center gap-1 border-b border-border bg-muted/50 px-2 py-1.5">
                {[Bold, Italic, Underline, List].map((Icon, i) => (
                  <button key={i} type="button" className="rounded p-1.5 text-muted-foreground hover:bg-card hover:text-foreground">
                    <Icon className="size-3.5" />
                  </button>
                ))}
              </div>
              <Textarea
                className="rounded-none border-0 shadow-none focus-visible:ring-0"
                rows={4}
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Service Type</Label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online Only</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="offline">Offline Assisted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>
                Estimated Turnaround Time (TAT) <span className="text-danger">*</span>
              </Label>
              <Input value={tat} onChange={(e) => setTat(e.target.value)} placeholder="3-5 business days" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Department Area</Label>
            <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Ministry / Department" />
          </div>
          <div className="space-y-1.5">
            <Label>Assigned Team Permissions</Label>
            <TagInput tags={teamTags} onChange={setTeamTags} tone="primary" />
          </div>
          <div className="space-y-1.5">
            <Label>Search Optimization Tags</Label>
            <TagInput tags={seoTags} onChange={setSeoTags} tone="muted" />
          </div>
        </CardContent>
      </Card>
    </ServiceWizardShell>
  );
}
