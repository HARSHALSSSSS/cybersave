import { useState } from 'react';
import { useNavigate } from 'react-router';
import { UploadCloud } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
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
  Switch,
  Textarea,
} from '@/components/ui';
import { servicesApi } from '../../services/services.api';
import { ServiceWizardShell } from '../../wizard/ServiceWizardShell';

export function MainServiceStepPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('identity');
  const [active, setActive] = useState(true);
  const [description, setDescription] = useState('');

  const { mutateAsync: createMain, isPending } = useMutation({
    mutationFn: () =>
      servicesApi.createMainService({
        name: name.trim(),
        description: description.trim() || undefined,
        isVisible: active,
      }),
  });

  const handleContinue = async () => {
    if (!name.trim()) {
      toast.error('Service name is required');
      return;
    }
    try {
      const created = await createMain();
      toast.success('Main service created');
      navigate(`/services/new/${created.id}/sub-services`);
    } catch {
      toast.error('Failed to create main service');
    }
  };

  return (
    <ServiceWizardShell
      step="main"
      crumbs={[
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Services', to: '/services' },
        { label: 'Create New Service' },
        { label: 'Main Service' },
      ]}
      onDraft={handleContinue}
      onContinue={handleContinue}
      continueLabel={isPending ? 'Saving…' : 'Save & Continue'}
    >
      <Card>
        <CardHeader>
          <CardTitle>Main Service General Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>
                Service Name <span className="text-danger">*</span>
              </Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Address Update" />
            </div>
            <div className="space-y-1.5">
              <Label>Service Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="identity">Identity Services</SelectItem>
                  <SelectItem value="certificates">Certificates</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Service Code (Auto-Generated)</Label>
              <Input value="Generated on save" disabled className="bg-muted" />
            </div>
            <div className="flex items-end justify-between gap-3 rounded-lg border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Status</p>
                <p className="text-xs text-muted-foreground">Toggle service availability</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-success-text">{active ? 'Active' : 'Inactive'}</span>
                <Switch checked={active} onCheckedChange={setActive} />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Icon Upload</Label>
            <button
              type="button"
              onClick={() => toast.info('Icon upload coming soon')}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-primary/30 bg-accent/40 px-4 py-10 text-center"
            >
              <UploadCloud className="size-8 text-primary" />
              <p className="text-sm font-medium text-foreground">Click to upload icon file</p>
              <p className="text-xs text-muted-foreground">SVG, PNG, JPG up to 1MB (Optimal size 48x48px)</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </ServiceWizardShell>
  );
}
