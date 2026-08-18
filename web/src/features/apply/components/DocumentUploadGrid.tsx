import { useRef, useState } from 'react';
import { CloudUpload, FileText, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import type { DocumentRequirement } from '@/services/api/services.api';
import type { ApplicationDetail, ApplicationDocument } from '@/services/api/applications.api';
import { applicationsApi } from '@/services/api/applications.api';
import { uploadApplicationDocument } from '@/features/apply/utils/uploadApplicationDocument';
import { cn } from '@/lib/utils';

type DocumentUploadGridProps = {
  applicationId: string;
  requirements: DocumentRequirement[];
  uploaded: ApplicationDocument[];
  onApplicationUpdated?: (application: ApplicationDetail) => void;
};

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
  onApplicationUpdated,
}: {
  applicationId: string;
  requirement: DocumentRequirement;
  existing?: ApplicationDocument;
  onApplicationUpdated?: (application: ApplicationDetail) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingName, setPendingName] = useState<string | null>(null);

  async function handleFile(file: File) {
    const maxBytes = requirement.maxFileSizeBytes || DEFAULT_MAX_BYTES;
    if (file.size > maxBytes) {
      toast.error(
        `${requirement.name} is too large (${formatMaxSize(file.size)}). Max allowed is ${formatMaxSize(maxBytes)}.`,
      );
      return;
    }

    setPendingName(file.name);
    try {
      const updated = await uploadApplicationDocument(
        applicationId,
        requirement.id,
        file,
      );
      toast.success(`${requirement.name} uploaded`);
      onApplicationUpdated?.(updated);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data
              ?.error?.message ?? `Could not upload ${requirement.name}`;
      toast.error(message);
    } finally {
      setPendingName(null);
    }
  }

  async function handleRemove() {
    if (!existing) return;
    try {
      const updated = await applicationsApi.deleteApplicationDocument(applicationId, existing.id);
      toast.success('Document removed');
      onApplicationUpdated?.(updated);
    } catch {
      toast.error('Could not remove document');
    }
  }

  const fileName =
    existing?.storedFile?.originalFileName ??
    pendingName ??
    existing?.documentRequirement?.name;
  const showAsUploaded = Boolean(existing) || Boolean(pendingName);
  const uploading = Boolean(pendingName) && !existing;

  return (
    <div
      className={cn(
        'relative rounded-2xl border-2 border-dashed p-5 transition',
        showAsUploaded ? 'border-[#2563EB]/40 bg-[#EFF6FF]/40' : 'border-[#E5E7EB] bg-[#FAFBFC]',
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

      {showAsUploaded ? (
        <div className="flex items-start gap-3">
          {uploading ? (
            <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-[#2563EB]" />
          ) : (
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-[#2563EB]" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#0A1629]">{requirement.name}</p>
            <p className="mt-1 truncate text-xs text-[#6B7280]">{fileName}</p>
            {uploading ? (
              <p className="mt-2 text-xs font-medium text-[#2563EB]">Uploading…</p>
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-2 text-xs font-medium text-[#2563EB] hover:underline"
              >
                Replace file
              </button>
            )}
          </div>
          {!uploading && existing ? (
            <button
              type="button"
              onClick={() => void handleRemove()}
              className="rounded-lg p-1 text-[#9CA3AF] hover:bg-white hover:text-red-600"
              aria-label="Remove"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center gap-3 text-center"
        >
          <CloudUpload className="h-8 w-8 text-[#2563EB]" />
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
  onApplicationUpdated,
}: DocumentUploadGridProps) {
  const sorted = [...requirements].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {sorted.map(req => {
        const existing = uploaded.find(
          d =>
            d.documentRequirementId === req.id || d.documentRequirement?.id === req.id,
        );
        return (
          <UploadTile
            key={req.id}
            applicationId={applicationId}
            requirement={req}
            existing={existing}
            onApplicationUpdated={onApplicationUpdated}
          />
        );
      })}
    </div>
  );
}
