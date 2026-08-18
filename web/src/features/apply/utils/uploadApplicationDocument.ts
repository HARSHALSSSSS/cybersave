import type { ApplicationDetail } from '@/services/api/applications.api';
import { applicationsApi } from '@/services/api/applications.api';
import { prepareFileForUpload } from '@/lib/prepareUploadFile';
import { transferFileToUploadSession } from '@/lib/upload';

function guessMimeType(file: File) {
  if (file.type) return file.type;
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'application/pdf';
  if (ext === 'png') return 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'webp') return 'image/webp';
  return 'application/octet-stream';
}

/** Request session, compress images when helpful, upload bytes, complete on server. */
export async function uploadApplicationDocument(
  applicationId: string,
  documentRequirementId: string,
  file: File,
): Promise<ApplicationDetail> {
  const prepared = await prepareFileForUpload(file);
  const mimeType = prepared.type || guessMimeType(prepared);

  const session = await applicationsApi.requestDocumentUpload(
    applicationId,
    documentRequirementId,
    prepared.name,
    mimeType,
  );

  await transferFileToUploadSession(
    session.uploadUrl,
    session.method,
    session.headers,
    prepared,
    () =>
      applicationsApi.uploadApplicationFile(
        applicationId,
        session.uploadSessionId,
        prepared,
      ),
  );

  return applicationsApi.completeDocumentUpload(
    applicationId,
    session.uploadSessionId,
    session.storedFileId,
  );
}
