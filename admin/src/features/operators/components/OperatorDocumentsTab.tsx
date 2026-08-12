import { Download, Eye, FileText, Image as ImageIcon, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import type { Operator, OperatorDocument } from '../types';

const DOC_STATUS = {
  verified: 'completed' as const,
  valid: 'info' as const,
  pending: 'pending' as const,
  expired: 'rejected' as const,
};

export function OperatorDocumentsTab({
  operator,
  documents,
}: {
  operator: Operator;
  documents: OperatorDocument[];
}) {
  const total = documents.length;
  const verified = documents.filter((d) => d.status === 'verified' || d.status === 'valid').length;
  const pending = documents.filter((d) => d.status === 'pending').length;
  const expired = documents.filter((d) => d.status === 'expired').length;

  return (
    <div className="space-y-6 pb-24">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total Documents', value: total, color: 'bg-primary' },
          { label: 'Verified Docs', value: verified, color: 'bg-success' },
          { label: 'Pending Review', value: pending, color: 'bg-info' },
          { label: 'Expired/Warnings', value: expired, color: 'bg-danger' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center justify-between gap-3 !py-4">
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="mt-1 text-2xl leading-8 font-semibold">{s.value}</p>
              </div>
              <span className={`size-2.5 rounded-full ${s.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Identity & Verification Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {documents.map((doc) => (
                <div key={doc.id} className="overflow-hidden rounded-xl border border-border">
                  <div className="flex h-24 items-center justify-center bg-muted">
                    {doc.type === 'pdf' ? (
                      <FileText className="size-8 text-danger" />
                    ) : (
                      <ImageIcon className="size-8 text-primary" />
                    )}
                  </div>
                  <div className="space-y-2 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm leading-5 font-semibold text-foreground">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">{doc.maskedId}</p>
                      </div>
                      <Badge variant={DOC_STATUS[doc.status]} className="capitalize">
                        {doc.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => toast.info(`View ${doc.title}`)}>
                        <Eye className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => toast.success('Download started')}>
                        <Download className="size-4" />
                      </Button>
                    </div>
                    <p className="text-[11px] leading-4 text-muted-foreground">
                      Uploaded: {doc.uploaded} • Expires: {doc.expires}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload New Document</CardTitle>
            </CardHeader>
            <CardContent>
              <button
                type="button"
                onClick={() => toast.info('File picker coming soon')}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-8 text-center transition-colors hover:bg-muted/50"
              >
                <UploadCloud className="size-8 text-primary" />
                <p className="text-sm font-medium text-foreground">Drag & drop files here or Browse files</p>
                <p className="text-xs text-muted-foreground">PDF, JPG, PNG • Max 10MB</p>
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compliance Action Required</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-danger-border bg-danger-bg px-3 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-danger-text">Hazmat Handling Expired</p>
                  <Badge variant="rejected">Action Required</Badge>
                </div>
                <p className="mt-1 text-xs leading-4 text-danger-text/80">
                  Certification expired on 01 Jun 2025. Request renewal immediately.
                </p>
              </div>
              <div className="rounded-lg border border-warning-border bg-warning-bg px-3 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-warning-text">Driving License Renew</p>
                  <Badge variant="pending">4 Years Left</Badge>
                </div>
                <p className="mt-1 text-xs leading-4 text-warning-text/80">
                  License remains valid until 2028. Schedule renewal reminder.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="fixed right-0 bottom-0 left-0 z-20 border-t border-border bg-card/95 backdrop-blur sm:left-[260px]">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="text-sm leading-5 text-muted-foreground">
            Requesting updates will notify operator {operator.name} immediately.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => toast.success('ZIP download started')}>
              Download All (ZIP)
            </Button>
            <Button onClick={() => toast.success('Document update requested')}>Request Document Update</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
