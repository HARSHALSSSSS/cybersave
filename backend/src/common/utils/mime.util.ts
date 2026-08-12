const EXT_TO_MIME: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export function normalizeMimeType(mimeType: string, fileName?: string): string {
  const trimmed = (mimeType || '').trim().toLowerCase();
  if (trimmed && trimmed.includes('/')) {
    if (trimmed === 'image/jpg') return 'image/jpeg';
    return trimmed;
  }
  const ext = fileName?.split('.').pop()?.toLowerCase();
  if (ext && EXT_TO_MIME[ext]) return EXT_TO_MIME[ext];
  return trimmed || 'application/octet-stream';
}

export function mimeMatchesRequirement(
  mimeType: string,
  fileName: string,
  allowedMimeTypes: string[],
  allowedFormats: string[],
): boolean {
  const normalized = normalizeMimeType(mimeType, fileName);
  const formats = allowedFormats.map(f => f.toLowerCase().replace(/^\./, ''));
  const mimes = allowedMimeTypes.map(m => normalizeMimeType(m));

  if (mimes.length === 0 && formats.length === 0) return true;

  if (mimes.includes(normalized)) return true;

  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext && formats.includes(ext)) {
    const expected = EXT_TO_MIME[ext];
    if (!expected || mimes.length === 0) return true;
    return mimes.includes(expected);
  }

  return false;
}
