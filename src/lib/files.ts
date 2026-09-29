/**
 * Shared file-upload primitives.
 *
 * These live in `lib/` rather than inside either feature because two
 * separate capture surfaces (job intake and resume intake) both need the
 * same size formatting and the same MIME/extension sniffing. Duplicating
 * them would mean a size limit or an accepted extension eventually
 * disagreeing with itself between the two screens.
 *
 * The server remains authoritative — everything here is a pre-flight so an
 * obviously invalid file never costs a round-trip.
 */

/** Mirrors the backend's upload limit. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Accepts on MIME type OR extension. Browsers report `application/pdf`
 * inconsistently (and often `""` for files from some OS pickers), so the
 * extension check is what actually saves the user here.
 */
export function isPdfFile(file: File): boolean {
  return (
    file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  );
}

export function isImageFile(file: File): boolean {
  return /^image\/(jpeg|png|webp)$/.test(file.type);
}

export function exceedsMaxSize(file: File): boolean {
  return file.size > MAX_UPLOAD_BYTES;
}
