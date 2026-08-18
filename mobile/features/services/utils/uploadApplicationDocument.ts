import type { ApplicationDetail } from '@services/api/applications.api';
import { applicationsApi } from '@services/api/applications.api';
import {
  transferFileToUploadSession,
  type PickedDocument,
} from '@features/services/utils/documentUpload';

/** Upload one application document through the fastest reliable path (API relay on our host). */
export async function uploadApplicationDocument(
  applicationId: string,
  documentRequirementId: string,
  picked: PickedDocument,
  mimeType: string,
): Promise<ApplicationDetail> {
  const session = await applicationsApi.requestDocumentUpload(
    applicationId,
    documentRequirementId,
    picked.name,
    mimeType,
  );

  await transferFileToUploadSession(
    picked,
    `/applications/${applicationId}/uploads/${session.uploadSessionId}/file`,
    session,
  );

  return applicationsApi.completeDocumentUpload(
    applicationId,
    session.uploadSessionId,
    session.storedFileId,
  );
}
