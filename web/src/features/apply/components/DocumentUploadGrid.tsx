import { useRef, useState } from 'react';
import { CloudUpload, FileText, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import type { DocumentRequirement } from '@/services/api/services.api';
import type { ApplicationDocument } from '@/services/api/applications.api';
import { applicationsApi } from '@/services/api/applications.api';
import { cn } from '@/lib/utils';

type DocumentUploadGridProps = {
  applicationId: string;
  requirements: DocumentRequirement[];
  uploaded: ApplicationDocument[];
  onUpdated: () => void;
};

function guessMimeType(file: File) {
  if (file.type) return file.type;
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'application/pdf';
  if (ext === 'png') return 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'webp') return 'image/webp';
  return 'application/octet-stream';
}

function formatMaxSize(bytes?: number) {
  if (!bytes) return '10MB';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${Math.round(mb)}MB` : `${Math.round(bytes / 1024)}KB`;
}

const DEFAULT_MAX_BYTES = 10 * 1024 * 1024;

function UploadTile({
  applicationId,
  requirement,
  existing,
  onUpdated,
}: {
  applicationId: string;
  requirement: DocumentRequirement;
  existing?: ApplicationDocument;
  onUpdated: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    const maxBytes = requirement.maxFileSizeBytes || DEFAULT_MAX_BYTES;
    if (file.size > maxBytes) {
      toast.error(
        `${requirement.name} is too large (${formatMaxSize(file.size)}). Max allowed is ${formatMaxSize(maxBytes)}.`,
      );
      return;
    }

    setUploading(true);
    try {
      const session = await applicationsApi.requestDocumentUpload(
        applicationId,
        requirement.id,
        file.name,
        file.type || guessMimeType(file),
      );

      await applicationsApi.uploadApplicationFile(
        applicationId,
        session.uploadSessionId,
        file,
      );

      await applicationsApi.completeDocumentUpload(
        applicationId,
        session.uploadSessionId,
        session.storedFileId,
      );
      toast.success(`${requirement.name} uploaded`);
      onUpdated();
    } catch (error) {
      const message =
        (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message ?? `Could not upload ${requirement.name}`;
      toast.error(message);
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    if (!existing) return;
    try {
      await applicationsApi.deleteApplicationDocument(applicationId, existing.id);
      toast.success('Document removed');
      onUpdated();
    } catch {
      toast.error('Could not remove document');
    }
  }

  const fileName = existing?.storedFile?.originalFileName ?? existing?.documentRequirement?.name;

  return (
    <div
      className={cn(
        'relative rounded-2xl border-2 border-dashed p-5 transition',
        existing ? 'border-[#2563EB]/40 bg-[#EFF6FF]/40' : 'border-[#E5E7EB] bg-[#FAFBFC]',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={requirement.allowedMimeTypes?.join(',') ?? '.pdf,.jpg,.jpeg,.png'}
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = '';
        }}
      />

      {existing ? (
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-[#2563EB]" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#0A1629]">{requirement.name}</p>
            <p className="mt-1 truncate text-xs text-[#6B7280]">{fileName}</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-2 text-xs font-medium text-[#2563EB] hover:underline"
            >
              Replace file
            </button>
          </div>
          <button
            type="button"
            onClick={() => void handleRemove()}
            className="rounded-lg p-1 text-[#9CA3AF] hover:bg-white hover:text-red-600"
            aria-label="Remove"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center gap-3 text-center"
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
          ) : (
            <CloudUpload className="h-8 w-8 text-[#2563EB]" />
          )}
          <div>
            <p className="text-sm font-semibold text-[#0A1629]">
              {requirement.name}
              {requirement.required ? <span className="text-red-500"> *</span> : null}
            </p>
            {requirement.description ? (
              <p className="mt-1 text-xs leading-5 text-[#6B7280]">{requirement.description}</p>
            ) : null}
            <p className="mt-3 text-xs text-[#6B7280]">
              Drag and drop your file here, or{' '}
              <span className="font-semibold text-[#2563EB]">browse</span>
            </p>
            <p className="mt-1 text-[10px] text-[#9CA3AF]">
              PDF, JPG, PNG up to {formatMaxSize(requirement.maxFileSizeBytes || DEFAULT_MAX_BYTES)}
            </p>
          </div>
        </button>
      )}
    </div>
  );
}

export function DocumentUploadGrid({
  applicationId,
  requirements,
  uploaded,
  onUpdated,
}: DocumentUploadGridProps) {
  const sorted = [...requirements].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {sorted.map(req => {
        const existing = uploaded.find(d => d.documentRequirementId === req.id);
        return (
          <UploadTile
            key={req.id}
            applicationId={applicationId}
            requirement={req}
            existing={existing}
            onUpdated={onUpdated}
          />
        );
      })}
    </div>
  );
}
