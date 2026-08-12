import { profileApi } from '@services/api';
import {
  pickDocument,
  transferFileToUploadSession,
  type PickedDocument,
} from '@features/services/utils/documentUpload';

export const TICKET_ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024;
export const TICKET_ATTACHMENT_MAX_COUNT = 5;
const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'pdf'];

export type UploadedTicketAttachment = {
  storedFileId: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
};

export async function pickTicketAttachment(): Promise<PickedDocument | null> {
  return pickDocument(ALLOWED_FORMATS);
}

export function isTicketAttachmentWithinSizeLimit(file: PickedDocument): boolean {
  return !file.size || file.size <= TICKET_ATTACHMENT_MAX_BYTES;
}

export async function uploadTicketAttachment(
  file: PickedDocument,
): Promise<UploadedTicketAttachment> {
  const session = await profileApi.requestDocumentUpload(file.name, file.mimeType);
  await transferFileToUploadSession(
    file,
    `/profile/documents/uploads/${session.uploadSessionId}/file`,
    session,
  );
  const completed = await profileApi.completeDocumentUpload(
    session.uploadSessionId,
    session.storedFileId,
  );
  return {
    storedFileId: completed.storedFileId,
    originalFileName: completed.originalFileName,
    mimeType: completed.mimeType,
    sizeBytes: completed.sizeBytes,
  };
}

export function formatAttachmentLines(attachments: UploadedTicketAttachment[]): string[] {
  if (!attachments.length) return [];
  return [
    '',
    'Attachments:',
    ...attachments.map(
      (attachment, index) =>
        `${index + 1}. ${attachment.originalFileName} (${attachment.mimeType}, ${Math.max(1, Math.round(attachment.sizeBytes / 1024))} KB, ref: ${attachment.storedFileId})`,
    ),
  ];
}
