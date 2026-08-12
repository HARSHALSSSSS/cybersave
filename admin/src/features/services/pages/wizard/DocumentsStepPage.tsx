import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { ServiceWizardShell } from '../../wizard/ServiceWizardShell';
import { formatBytes, useSaveDocuments, useServiceVersionBundle } from '../../wizard/useServiceVersion';

type DocRow = {
  id: string;
  type: string;
  formats: string;
  maxSize: string;
  mandatory: boolean;
  maxFileSizeBytes?: number;
};

export function DocumentsStepPage() {
  const { mainServiceId = '', subServiceId = '' } = useParams();
  const navigate = useNavigate();
  const base = `/services/new/${mainServiceId}/sub/${subServiceId}`;

  const { data: bundle, isLoading, isError } = useServiceVersionBundle(mainServiceId, subServiceId);
  const { mutateAsync: saveDocuments, isPending } = useSaveDocuments(mainServiceId, subServiceId);
  const [docs, setDocs] = useState<DocRow[]>([]);

  useEffect(() => {
    const requirements = bundle?.documentRequirements ?? [];
    if (requirements.length === 0) return;
    setDocs(
      requirements.map((d) => ({
        id: d.id,
        type: d.name,
        formats: (d.allowedFormats ?? ['PDF']).join(', '),
        maxSize: formatBytes(d.maxFileSizeBytes),
        mandatory: Boolean(d.required),
        maxFileSizeBytes: d.maxFileSizeBytes ?? 2 * 1024 * 1024,
      })),
    );
  }, [bundle]);

  const mainServiceName = bundle?.subService?.mainService?.name ?? 'Main Service';

  const persist = async () => {
    await saveDocuments({
      requirements: docs.map((doc, index) => ({
        name: doc.type,
        required: doc.mandatory,
        allowedFormats: doc.formats.split(',').map((f) => f.trim()).filter(Boolean),
        maxFileSizeBytes: doc.maxFileSizeBytes ?? 2 * 1024 * 1024,
        sortOrder: index,
      })),
    });
  };

  const handleSave = async (next?: string) => {
    try {
      await persist();
      toast.success('Documents saved');
      if (next) navigate(next);
    } catch {
      toast.error('Failed to save documents');
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
    return <p className="text-sm text-danger">Failed to load document requirements.</p>;
  }

  return (
    <ServiceWizardShell
      step="documents"
      crumbs={[
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Services', to: '/services' },
        { label: mainServiceName, to: `/services/new/${mainServiceId}/sub-services` },
        { label: 'Documents' },
      ]}
      onDraft={() => handleSave()}
      onContinue={() => handleSave(`${base}/pricing`)}
      continueLabel={isPending ? 'Saving…' : 'Save & Continue'}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Document Requirements & Limits</CardTitle>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => {
              setDocs((prev) => [
                ...prev,
                {
                  id: `d-${Date.now()}`,
                  type: 'New Document',
                  formats: 'PDF',
                  maxSize: '2 MB',
                  mandatory: true,
                  maxFileSizeBytes: 2 * 1024 * 1024,
                },
              ]);
              toast.success('Document requirement added');
            }}
          >
            <Plus className="size-4" />
            Add Required Document
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Type</TableHead>
                <TableHead>Allowed Formats</TableHead>
                <TableHead>Max Size</TableHead>
                <TableHead>Mandatory</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {docs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No document requirements yet.
                  </TableCell>
                </TableRow>
              ) : (
                docs.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="size-4 text-primary" />
                        <span className="font-medium">{doc.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{doc.formats}</TableCell>
                    <TableCell className="text-muted-foreground">{doc.maxSize}</TableCell>
                    <TableCell>
                      <Badge variant={doc.mandatory ? 'rejected' : 'muted'}>
                        {doc.mandatory ? 'Required' : 'Optional'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="size-8 text-primary" onClick={() => toast.info('Edit inline in a future iteration')}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-danger"
                          onClick={() => setDocs((prev) => prev.filter((d) => d.id !== doc.id))}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </ServiceWizardShell>
  );
}
