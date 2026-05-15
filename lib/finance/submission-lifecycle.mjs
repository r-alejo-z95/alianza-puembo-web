import { normalizeFinanceReceiptPath } from "./receipt-links.mjs";

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
  addFinanceReceiptPath(paths, value.path);

  Object.values(value).forEach((child) => collectFromUnknown(child, paths, seen));
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
