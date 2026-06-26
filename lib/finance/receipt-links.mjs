const RECEIPT_ACCESS_PATH = "/api/admin/finance/receipt";
const NON_RECEIPT_BUCKET_PREFIXES = [
  "event-posters/",
  "form_uploads/",
  "forms/",
  "news-images/",
  "public-images/",
];

export function normalizeFinanceReceiptPath(path) {
  if (typeof path !== "string") return null;

  const trimmed = path.trim();
  if (!trimmed || trimmed.includes("..") || trimmed.includes("\\")) return null;
  if (NON_RECEIPT_BUCKET_PREFIXES.some((prefix) => trimmed.startsWith(prefix))) return null;

  const withoutBucket = trimmed.startsWith("finance_receipts/")
    ? trimmed.slice("finance_receipts/".length)
    : trimmed;

  if (
    !withoutBucket ||
    withoutBucket.startsWith("/") ||
    withoutBucket.startsWith("finance_receipts/") ||
    withoutBucket.includes("://")
  ) {
    return null;
  }

  return withoutBucket;
}

export function buildFinanceReceiptAccessUrl(origin, path) {
  const base = String(origin || "").replace(/\/$/, "");
  const normalized = normalizeFinanceReceiptPath(path);
  if (!base || !normalized) return "";

  return `${base}${RECEIPT_ACCESS_PATH}?path=${encodeURIComponent(`finance_receipts/${normalized}`)}`;
}
