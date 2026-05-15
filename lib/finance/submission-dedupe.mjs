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
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return Math.round(amount * 100);
}

function paymentAmount(payment) {
  return Number(payment?.extracted_data?.amount ?? payment?.amount_claimed ?? 0) || 0;
}

function submittedTotal(submission) {
  return (submission?.form_submission_payments || [])
    .filter((payment) => !payment?.manual_disposition && ACTIVE_PAYMENT_STATUSES.has(payment?.status))
    .reduce((sum, payment) => sum + paymentAmount(payment), 0);
}

function remainingBalance(totalAmount, submission) {
  const total = Number(totalAmount ?? 0);
  if (!Number.isFinite(total) || total <= 0) return 0;
  return Math.max(total - submittedTotal(submission), 0);
}

function getSubmissionName(submission) {
  const answers = Array.isArray(submission?.answers) ? submission.answers : [];
  const data = submission?.data && typeof submission.data === "object" ? submission.data : {};
  const entries = [
    ...answers.map((answer) => ({
      key: normalizeText(answer?.label || answer?.key),
      value: cleanText(answer?.value),
    })),
    ...Object.entries(data).map(([key, value]) => ({
      key: normalizeText(key),
      value: cleanText(value),
    })),
  ];

  const preferred = entries.find(
    (entry) =>
      entry.value &&
      !entry.value.includes("@") &&
      (entry.key.includes("nombre completo") ||
        entry.key.includes("nombres y apellidos") ||
        entry.key.includes("nombre del participante") ||
        entry.key.includes("nombre del inscrito")),
  );

  return preferred?.value || "";
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

export function detectFinancialSubmissionConflict({
  incoming,
  existingSubmissions = [],
  totalAmount = 0,
}) {
  const incomingEmail = normalizeEmail(incoming?.notificationEmail);
  const incomingName = cleanText(incoming?.participantName);

  for (const submission of existingSubmissions || []) {
    if (submission?.is_archived) continue;

    const duplicatePayment = (submission?.form_submission_payments || []).find((payment) =>
      !payment?.manual_disposition && hasSameReceipt(incoming?.receiptData, payment),
    );

    if (duplicatePayment) {
      return {
        type: "duplicate_receipt",
        action: "block",
        matchedSubmission: submission,
        matchedPayment: duplicatePayment,
        remainingBalance: remainingBalance(totalAmount, submission),
      };
    }
  }

  for (const submission of existingSubmissions || []) {
    if (submission?.is_archived) continue;

    const existingEmail = normalizeEmail(submission?.notification_email);
    if (!incomingEmail || !existingEmail || incomingEmail !== existingEmail) continue;

    const existingName = getSubmissionName(submission);
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
