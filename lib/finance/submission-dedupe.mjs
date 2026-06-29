import { findNameInSubmission } from "../forms/submission-name.mjs";

const NAME_FILLER_TOKENS = new Set([
  "de",
  "del",
  "la",
  "las",
  "los",
  "y",
  "e",
]);

const ACTIVE_PAYMENT_STATUSES = new Set(["pending", "manual_review", "verified"]);

function cleanText(value) {
  return String(value ?? "").trim();
}

function normalizeText(value) {
  return cleanText(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizePersonNameTokens(value) {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length >= 2 && !NAME_FILLER_TOKENS.has(token))
    .sort();
}

function normalizeEmail(value) {
  return cleanText(value).toLowerCase();
}

function normalizeReference(value) {
  return cleanText(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function amountCents(value) {
  const amount = Math.abs(Number(value ?? 0));
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return Math.round(amount * 100);
}

function paymentAmount(payment) {
  const amount = Number(payment?.extracted_data?.amount ?? payment?.amount_claimed ?? 0) || 0;
  return Math.abs(amount);
}

function submittedTotal(submission) {
  return (submission?.form_submission_payments || [])
    .filter((payment) => !payment?.manual_disposition && ACTIVE_PAYMENT_STATUSES.has(payment?.status))
    .reduce((sum, payment) => sum + paymentAmount(payment), 0);
}

function expectedAmount(totalAmount, submission) {
  const snapshot = Number(submission?.expected_amount ?? 0);
  if (Number.isFinite(snapshot) && snapshot > 0) return snapshot;
  const fallback = Number(totalAmount ?? 0);
  return Number.isFinite(fallback) ? fallback : 0;
}

function remainingBalance(totalAmount, submission) {
  const total = expectedAmount(totalAmount, submission);
  if (!Number.isFinite(total) || total <= 0) return 0;
  return Math.max(total - submittedTotal(submission), 0);
}

function editDistanceAtMostOne(a, b) {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;

  let edits = 0;
  let i = 0;
  let j = 0;

  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i += 1;
      j += 1;
      continue;
    }

    edits += 1;
    if (edits > 1) return false;

    if (a.length > b.length) i += 1;
    else if (b.length > a.length) j += 1;
    else {
      i += 1;
      j += 1;
    }
  }

  return true;
}

function tokensMatch(incomingToken, existingToken) {
  if (incomingToken === existingToken) return true;
  if (incomingToken.length >= 4 && existingToken.length >= 4) {
    return editDistanceAtMostOne(incomingToken, existingToken);
  }
  return false;
}

function hasStrongNameOverlap(incomingName, existingName) {
  const incomingTokens = normalizePersonNameTokens(incomingName);
  const existingTokens = normalizePersonNameTokens(existingName);
  if (incomingTokens.length === 0 || existingTokens.length === 0) return false;

  const matches = incomingTokens.filter((incomingToken) =>
    existingTokens.some((existingToken) => tokensMatch(incomingToken, existingToken)),
  );

  return matches.length >= Math.min(2, incomingTokens.length);
}

function hasSameReceipt(incomingData, payment) {
  const incomingReference = normalizeReference(incomingData?.reference);
  const paymentReference = normalizeReference(payment?.extracted_data?.reference);
  if (!incomingReference || incomingReference.length < 5 || incomingReference !== paymentReference) {
    return false;
  }

  const incomingAmount = amountCents(incomingData?.amount);
  const paymentAmountCents = amountCents(payment?.extracted_data?.amount ?? payment?.amount_claimed);
  const amountMatches = incomingAmount !== null && incomingAmount === paymentAmountCents;

  const incomingDate = cleanText(incomingData?.date);
  const paymentDate = cleanText(payment?.extracted_data?.date);
  const dateMatches = !!incomingDate && incomingDate === paymentDate;

  return amountMatches || dateMatches;
}

function buildSharedPaymentDetails({
  existingSubmissions = [],
  matchedSubmission,
  matchedPayment,
  totalAmount,
  allowSharedReceipts = false,
  sharedReceiptMaxSubmissions = 1,
}) {
  const perRegistrationCents = amountCents(matchedSubmission?.expected_amount ?? totalAmount);
  const paymentCents = amountCents(matchedPayment?.extracted_data?.amount ?? matchedPayment?.amount_claimed);

  if (!perRegistrationCents || !paymentCents) {
    return {
      eligible: false,
      reason: "missing_amount",
      capacity: 1,
      usedSlots: 1,
      availableSlots: 0,
    };
  }

  const configuredCapacity =
    allowSharedReceipts && Number(sharedReceiptMaxSubmissions) > 1
      ? Math.floor(Number(sharedReceiptMaxSubmissions))
      : null;
  const inferredCapacity = Math.max(Math.floor(paymentCents / perRegistrationCents), 1);
  const capacity = configuredCapacity || inferredCapacity;
  const coveredByThisPayment = (existingSubmissions || []).filter(
    (submission) =>
      !submission?.is_archived &&
      submission?.coverage_mode === "covered_by_used_payment" &&
      submission?.covered_by_submission_id === matchedSubmission?.id,
  ).length;
  const usedSlots = 1 + coveredByThisPayment;
  const availableSlots = Math.max(capacity - usedSlots, 0);

  return {
    eligible: capacity > 1 && availableSlots > 0,
    reason: capacity > 1 && availableSlots > 0 ? null : "capacity_exhausted",
    capacity,
    usedSlots,
    availableSlots,
    paymentAmount: paymentCents / 100,
    perRegistrationAmount: perRegistrationCents / 100,
  };
}

export function detectFinancialSubmissionConflict({
  incoming,
  existingSubmissions = [],
  totalAmount = 0,
  allowSharedReceipts = false,
  sharedReceiptMaxSubmissions = 1,
}) {
  const incomingEmail = normalizeEmail(incoming?.notificationEmail);
  const incomingName = cleanText(incoming?.participantName);

  for (const submission of existingSubmissions || []) {
    if (submission?.is_archived) continue;

    const duplicatePayment = (submission?.form_submission_payments || []).find((payment) =>
      !payment?.manual_disposition && hasSameReceipt(incoming?.receiptData, payment),
    );

    if (duplicatePayment) {
      const sharedPayment = buildSharedPaymentDetails({
        existingSubmissions,
        matchedSubmission: submission,
        matchedPayment: duplicatePayment,
        totalAmount,
        allowSharedReceipts,
        sharedReceiptMaxSubmissions,
      });

      return {
        type: "duplicate_receipt",
        action: sharedPayment.eligible ? "confirm_shared_payment" : "block",
        matchedSubmission: submission,
        matchedPayment: duplicatePayment,
        remainingBalance: remainingBalance(totalAmount, submission),
        sharedPayment,
      };
    }
  }

  for (const submission of existingSubmissions || []) {
    if (submission?.is_archived) continue;

    const existingEmail = normalizeEmail(submission?.notification_email);
    if (!incomingEmail || !existingEmail || incomingEmail !== existingEmail) continue;

    const existingName = findNameInSubmission(submission, { fallback: "" });
    const hasNameSignal = !incomingName || !existingName || hasStrongNameOverlap(incomingName, existingName);
    if (!hasNameSignal) continue;

    const balance = remainingBalance(totalAmount, submission);
    return {
      type: balance > 0 ? "existing_partial_registration" : "existing_registration",
      action: "send_tracking_link",
      matchedSubmission: submission,
      remainingBalance: balance,
    };
  }

  return null;
}
