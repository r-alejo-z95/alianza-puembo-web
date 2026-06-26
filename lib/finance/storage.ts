import { createAdminClient } from "@/lib/supabase/server";

const FINANCE_RECEIPTS_BUCKET = "finance_receipts";
const FORM_UPLOADS_BUCKET = "form_uploads";
const FORM_UPLOADS_FILE_SIZE_LIMIT = 5 * 1024 * 1024;
const FORM_UPLOADS_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

function isBucketNotFoundError(message?: string | null) {
  const normalized = String(message || "").toLowerCase();
  return normalized.includes("not found") || normalized.includes("does not exist");
}

export async function ensureFinanceReceiptsBucket() {
  return ensurePrivateBucket(FINANCE_RECEIPTS_BUCKET);
}

export async function ensureFormUploadsBucket() {
  return ensurePrivateBucket(FORM_UPLOADS_BUCKET, {
    fileSizeLimit: FORM_UPLOADS_FILE_SIZE_LIMIT,
    allowedMimeTypes: FORM_UPLOADS_ALLOWED_MIME_TYPES,
  });
}

async function ensurePrivateBucket(
  bucketName: string,
  options: {
    fileSizeLimit?: number;
    allowedMimeTypes?: string[];
  } = {},
) {
  const supabaseAdmin = createAdminClient();

  const { data: existingBucket, error: getBucketError } = await supabaseAdmin.storage.getBucket(
    bucketName,
  );

  if (existingBucket && !getBucketError) {
    return { success: true };
  }

  if (getBucketError && !isBucketNotFoundError(getBucketError.message)) {
    return { error: getBucketError.message };
  }

  const { error: createError } = await supabaseAdmin.storage.createBucket(
    bucketName,
    {
      public: false,
      fileSizeLimit: options.fileSizeLimit,
      allowedMimeTypes: options.allowedMimeTypes,
    },
  );

  if (createError) {
    const normalized = String(createError.message || "").toLowerCase();
    if (!normalized.includes("already exists") && !normalized.includes("duplicate")) {
      return { error: createError.message };
    }
  }

  return { success: true };
}
