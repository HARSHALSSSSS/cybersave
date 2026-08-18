const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_EDGE_PX = 1920;
const JPEG_QUALITY = 0.82;
const SKIP_COMPRESS_BELOW_BYTES = 350_000;

/** Shrink large photos before upload — PDFs and small images pass through unchanged. */
export async function prepareFileForUpload(file: File): Promise<File> {
  const mime = file.type || guessImageMime(file.name);
  if (!IMAGE_TYPES.has(mime) || file.size < SKIP_COMPRESS_BELOW_BYTES) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE_PX / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const outputType = mime === 'image/png' && file.size < 1_500_000 ? 'image/png' : 'image/jpeg';
    const blob = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(resolve, outputType, JPEG_QUALITY),
    );
    if (!blob || blob.size >= file.size) return file;

    const ext = outputType === 'image/png' ? '.png' : '.jpg';
    const baseName = file.name.replace(/\.[^.]+$/, '') || 'document';
    return new File([blob], `${baseName}${ext}`, { type: outputType });
  } catch {
    return file;
  }
}

function guessImageMime(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  return 'image/jpeg';
}
