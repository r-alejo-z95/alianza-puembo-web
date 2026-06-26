import { normalizeFinanceReceiptPath } from "./receipt-links.mjs";

const FORM_UPLOADS_BUCKET = "form_uploads";

export function buildActiveReconciledTransactionIds(paymentRows = []) {
  const ids = new Set();

  for (const row of paymentRows || []) {
    if (!row?.bank_transaction_id) continue;
    if (row?.form_submissions?.is_archived === true) continue;
    ids.add(row.bank_transaction_id);
  }

  return ids;
}

function addFinanceReceiptPath(paths, path) {
  const normalized = normalizeFinanceReceiptPath(path);
  if (normalized) paths.add(normalized);
}

function normalizeFormUploadPath(path, { allowBare = false } = {}) {
  if (typeof path !== "string") return null;

  const trimmed = path.trim();
  if (!trimmed || trimmed.includes("..") || trimmed.includes("\\") || trimmed.includes("://")) {
    return null;
  }

  const bucketPrefix = `${FORM_UPLOADS_BUCKET}/`;
  const withoutBucket = trimmed.startsWith(bucketPrefix)
    ? trimmed.slice(bucketPrefix.length)
    : allowBare
      ? trimmed
      : null;

  if (
    !withoutBucket ||
    withoutBucket.startsWith("/") ||
    withoutBucket.startsWith("finance_receipts/") ||
    withoutBucket.startsWith(`${FORM_UPLOADS_BUCKET}/`)
  ) {
    return null;
  }

  return withoutBucket;
}

function addFormUploadPath(paths, path, options) {
  const normalized = normalizeFormUploadPath(path, options);
  if (normalized) paths.add(normalized);
}

function collectFromUnknown(value, paths, seen) {
  if (!value || typeof value !== "object") return;
  if (seen.has(value)) return;
  seen.add(value);

  if (Array.isArray(value)) {
    value.forEach((item) => collectFromUnknown(item, paths, seen));
    return;
  }

  addFinanceReceiptPath(paths, value.financial_receipt_path);
  addFinanceReceiptPath(paths, value.receipt_path);
  if (value.bucket !== FORM_UPLOADS_BUCKET) {
    addFinanceReceiptPath(paths, value.path);
  }

  Object.values(value).forEach((child) => collectFromUnknown(child, paths, seen));
}

function collectFormUploadsFromUnknown(value, paths, seen) {
  if (!value || typeof value !== "object") return;
  if (seen.has(value)) return;
  seen.add(value);

  if (Array.isArray(value)) {
    value.forEach((item) => collectFormUploadsFromUnknown(item, paths, seen));
    return;
  }

  addFormUploadPath(paths, value.storage_path);
  if (value.bucket === FORM_UPLOADS_BUCKET) {
    addFormUploadPath(paths, value.path, { allowBare: true });
  } else {
    addFormUploadPath(paths, value.path);
  }

  Object.values(value).forEach((child) => collectFormUploadsFromUnknown(child, paths, seen));
}

export function collectFinanceReceiptPathsFromSubmission(submission) {
  const paths = new Set();
  const seen = new WeakSet();

  addFinanceReceiptPath(paths, submission?.coverage_backup_path);
  collectFromUnknown(submission?.data, paths, seen);

  for (const answer of submission?.answers || []) {
    collectFromUnknown(answer?.value, paths, seen);
  }

  for (const payment of submission?.form_submission_payments || []) {
    addFinanceReceiptPath(paths, payment?.receipt_path);
  }

  return [...paths];
}

export function collectStoragePathsFromSubmission(submission) {
  const formUploadPaths = new Set();
  const seenFormUploads = new WeakSet();

  collectFormUploadsFromUnknown(submission?.data, formUploadPaths, seenFormUploads);

  for (const answer of submission?.answers || []) {
    collectFormUploadsFromUnknown(answer?.value, formUploadPaths, seenFormUploads);
  }

  return {
    finance_receipts: collectFinanceReceiptPathsFromSubmission(submission),
    form_uploads: [...formUploadPaths],
  };
}
