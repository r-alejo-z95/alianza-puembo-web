import { createAdminClient } from "@/lib/supabase/server";

const FINANCE_RECEIPTS_BUCKET = "finance_receipts";

function isBucketNotFoundError(message?: string | null) {
  const normalized = String(message || "").toLowerCase();
  return normalized.includes("not found") || normalized.includes("does not exist");
}

export async function ensureFinanceReceiptsBucket() {
  const supabaseAdmin = createAdminClient();

  const { data: existingBucket, error: getBucketError } = await supabaseAdmin.storage.getBucket(
    FINANCE_RECEIPTS_BUCKET,
  );

  if (existingBucket && !getBucketError) {
    return { success: true };
  }

  if (getBucketError && !isBucketNotFoundError(getBucketError.message)) {
    return { error: getBucketError.message };
  }

  const { error: createError } = await supabaseAdmin.storage.createBucket(
    FINANCE_RECEIPTS_BUCKET,
    { public: false },
  );

  if (createError) {
    const normalized = String(createError.message || "").toLowerCase();
    if (!normalized.includes("already exists") && !normalized.includes("duplicate")) {
      return { error: createError.message };
    }
  }

  return { success: true };
}
