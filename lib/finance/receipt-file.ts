export const RECEIPT_FILE_ACCEPT = "image/*,application/pdf";
export const MAX_RECEIPT_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const SUPPORTED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const MIME_TYPE_EXTENSIONS: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

export function isSupportedReceiptMimeType(mimeType?: string | null) {
  const normalized = String(mimeType || "").trim().toLowerCase();
  return normalized === "application/pdf" || SUPPORTED_IMAGE_MIME_TYPES.has(normalized);
}

export function getReceiptFileExtension(fileName?: string | null, mimeType?: string | null) {
  const normalizedMimeType = String(mimeType || "").trim().toLowerCase();
  const extensionFromMimeType = MIME_TYPE_EXTENSIONS[normalizedMimeType];
  if (extensionFromMimeType) return extensionFromMimeType;

  const extension = String(fileName || "")
    .split(".")
    .pop()
    ?.trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  return extension || "jpg";
}
