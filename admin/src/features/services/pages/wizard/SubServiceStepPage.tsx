import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { servicesApi } from '../../services/services.api';
import { ServiceWizardShell } from '../../wizard/ServiceWizardShell';
import { setWizardVersionId } from '../../wizard/wizard-version';

export function SubServiceStepPage() {
  const { mainServiceId = '' } = useParams();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');

  const { data: mainService, isLoading, isError } = useQuery({
    queryKey: ['main-service', mainServiceId],
    queryFn: () => servicesApi.getMainService(mainServiceId),
    enabled: Boolean(mainServiceId),
  });

  const { mutateAsync: createSub, isPending } = useMutation({
    mutationFn: (subName: string) =>
      servicesApi.createSubService(mainServiceId, { name: subName, description: undefined }),
    onSuccess: (result) => {
      setWizardVersionId(result.subService.id, result.draftVersionId);
      queryClient.invalidateQueries({ queryKey: ['main-service', mainServiceId] });
    },
  });

  const crumbs = useMemo(
    () => [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Services', to: '/services' },
      { label: mainService?.name ?? 'Main Service', to: `/services/new/${mainServiceId}/sub-services` },
      { label: 'Sub Service' },
    ],
    [mainService?.name, mainServiceId],
  );

  const handleAdd = async () => {
    if (!name.trim()) {
      toast.error('Enter a sub-service name');
      return;
    }
    try {
      const result = await createSub(name.trim());
      setWizardVersionId(result.subService.id, result.draftVersionId);
      setName('');
      toast.success('Sub-service added');
    } catch {
      toast.error('Failed to create sub-service');
    }
  };

  const handleEdit = (subId: string, versionId?: string) => {
    if (versionId) {
      setWizardVersionId(subId, versionId);
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

  if (isError || !mainService) {
    return <p className="text-sm text-danger">Failed to load main service.</p>;
  }

  const rows = mainService.subServices;

  return (
    <ServiceWizardShell
      step="sub"
      crumbs={crumbs}
      onDraft={() => toast.success('Sub services saved')}
      onContinue={() => {
        toast.message('Select a sub-service and click Edit to configure Overview → Publish');
      }}
      continueLabel="Continue"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Sub Services under {mainService.name}</CardTitle>
          <Button size="sm" className="gap-1.5" onClick={handleAdd} disabled={isPending}>
            <Plus className="size-4" />
            Add Sub Service
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="New sub-service name…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="sm:max-w-md"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sub Service</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No sub-services yet. Add one above.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => {
                  const isPublished = row.latestVersion?.lifecycleStatus === 'PUBLISHED';
                  return (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{row.slug}</TableCell>
                      <TableCell>
                        <Badge variant={isPublished ? 'completed' : 'muted'}>
                          {row.latestVersion?.lifecycleStatus?.toLowerCase() ?? 'draft'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="size-8 text-primary" asChild>
                            <Link
                              to={`/services/new/${mainServiceId}/sub/${row.id}/overview`}
                              onClick={() => handleEdit(row.id, row.latestVersion?.id)}
                            >
                              <Pencil className="size-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-danger"
                            onClick={() => toast.message('Delete sub-service not available via API yet')}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <p className="text-sm text-muted-foreground">
            Click the pencil icon on a sub-service to configure Overview → Form Builder → Documents → Pricing → Publish.
          </p>
        </CardContent>
      </Card>
    </ServiceWizardShell>
  );
}
