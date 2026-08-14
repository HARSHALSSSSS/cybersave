import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Button, Input, Label } from '@/components/ui/button';
import { LoadingBlock, EmptyState } from '@/components/ui/primitives';
import { SecurityNoticeFull } from '@/features/apply/components/SecurityNotice';
import { profileApi, profileQueryKeys } from '@/services/api';
import { uploadToPresignedUrl } from '@/lib/upload';
import { formatDate } from '@/lib/utils';

export function DocumentsPage() {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [docName, setDocName] = useState('');
  const [uploading, setUploading] = useState(false);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: profileQueryKeys.documents(),
    queryFn: () => profileApi.listSavedDocuments(),
  });

  async function handleUpload(file: File) {
    if (!docName.trim()) {
      toast.error('Enter a document name first');
      return;
    }
    setUploading(true);
    try {
      const session = await profileApi.requestProfileDocumentUpload(
        file.name,
        file.type || 'application/octet-stream',
      );
      await uploadToPresignedUrl(
        session.uploadUrl,
        file,
        session.headers,
        session.method || 'PUT',
      );
      await profileApi.completeProfileDocumentUpload(session.uploadSessionId, session.storedFileId);
      await profileApi.createSavedDocument({
        name: docName.trim(),
        storedFileId: session.storedFileId,
        mimeType: file.type,
        originalFileName: file.name,
      });
      toast.success('Document saved');
      setDocName('');
      await queryClient.invalidateQueries({ queryKey: profileQueryKeys.documents() });
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(id: string) {
    try {
      const { downloadUrl } = await profileApi.getSavedDocumentDownload(id);
      window.open(downloadUrl, '_blank');
    } catch {
      toast.error('Could not download');
    }
  }

  async function handleDelete(id: string) {
    try {
      await profileApi.deleteSavedDocument(id);
      toast.success('Document removed');
      await queryClient.invalidateQueries({ queryKey: profileQueryKeys.documents() });
    } catch {
      toast.error('Could not delete');
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Portal', to: '/' }, { label: 'Documents Locker' }]} />

      <div>
        <h1 className="font-display text-3xl font-bold text-[#0A1629]">Documents Locker</h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          Securely store verified certificates and identity proofs for reuse across applications.
        </p>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-[#0A1629]">Upload Document</h2>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <Label htmlFor="docName">Document name</Label>
            <Input
              id="docName"
              value={docName}
              onChange={e => setDocName(e.target.value)}
              placeholder="e.g. Aadhaar Card"
              className="mt-1.5"
            />
          </div>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) void handleUpload(file);
              e.target.value = '';
            }}
          />
          <Button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? 'Uploading…' : 'Choose File'}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <LoadingBlock className="h-48" />
      ) : documents.length === 0 ? (
        <EmptyState
          title="No saved documents"
          description="Upload identity proofs and certificates to reuse them when applying for services."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map(doc => (
            <article
              key={doc.id}
              className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm"
            >
              <p className="font-semibold text-[#0A1629]">{doc.name}</p>
              <p className="mt-1 truncate text-xs text-[#6B7280]">
                {doc.originalFileName ?? doc.documentType ?? 'Document'}
              </p>
              <p className="mt-1 text-xs text-[#9CA3AF]">{formatDate(doc.createdAt)}</p>
              <div className="mt-4 flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => void handleDownload(doc.id)}>
                  Download
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => void handleDelete(doc.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <SecurityNoticeFull />
    </div>
  );
}
