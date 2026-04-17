type PaymentLike = {
  amount_claimed?: number | string | null;
  extracted_data?: Record<string, any> | null;
  manual_disposition?: "incorrecto" | "duplicado" | null;
  status?: string | null;
};

type SubmissionLike = {
  coverage_amount?: number | string | null;
  coverage_mode?: "bank_receipt" | "cash" | "card" | "scholarship" | "covered_by_used_payment" | null;
  form_submission_payments?: PaymentLike[] | null;
};

function toAmount(value: unknown) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}

export function getActivePayment(payments: PaymentLike[] = []) {
  return payments.find((payment) => !payment?.manual_disposition) || null;
}

export function getFinanceDisplayState(submission: SubmissionLike) {
  const coverageMode = submission?.coverage_mode || "bank_receipt";
  const payments = Array.isArray(submission?.form_submission_payments)
    ? submission.form_submission_payments
    : [];
  const activePayment = getActivePayment(payments);
  const discardedIncorrect = payments.some((payment) => payment?.manual_disposition === "incorrecto");
  const discardedDuplicate = payments.some((payment) => payment?.manual_disposition === "duplicado");

  if (coverageMode === "cash") return "Pago en efectivo";
  if (coverageMode === "card") return "Pago con tarjeta";
  if (coverageMode === "scholarship") return "Beca";
  if (coverageMode === "covered_by_used_payment") return "Cubierta por pago ya usado";
  if (discardedIncorrect) return "Comprobante descartado - contactar usuario";
  if (activePayment?.status === "verified") return "Conciliado";
  if (activePayment?.status === "pending") return "Pago bancario válido";
  if (activePayment?.status === "manual_review") return "Pago bancario en revisión";
  if (discardedDuplicate) return "Cubierta por pago ya usado";
  return "Pago bancario en revisión";
}

export function getRevenueContribution(submission: SubmissionLike) {
  const coverageMode = submission?.coverage_mode || "bank_receipt";
  if (coverageMode === "cash" || coverageMode === "card") {
    return toAmount(submission?.coverage_amount);
  }
  if (coverageMode === "scholarship" || coverageMode === "covered_by_used_payment") {
    return 0;
  }
  const payments = Array.isArray(submission?.form_submission_payments)
    ? submission.form_submission_payments
    : [];
  return payments
    .filter((payment) => payment?.status === "verified" && !payment?.manual_disposition)
    .reduce(
      (sum, payment) => sum + toAmount(payment?.extracted_data?.amount ?? payment?.amount_claimed),
      0,
    );
}

export function getDisplayedSubmissionAmount(submission: SubmissionLike) {
  const coverageMode = submission?.coverage_mode || "bank_receipt";
  if (coverageMode === "cash" || coverageMode === "card") {
    return toAmount(submission?.coverage_amount);
  }
  if (coverageMode === "scholarship" || coverageMode === "covered_by_used_payment") {
    return 0;
  }
  const payments = Array.isArray(submission?.form_submission_payments)
    ? submission.form_submission_payments
    : [];
  return payments
    .filter((payment) => payment?.manual_disposition !== "incorrecto" && payment?.manual_disposition !== "duplicado")
    .reduce(
      (sum, payment) => sum + toAmount(payment?.extracted_data?.amount ?? payment?.amount_claimed),
      0,
    );
}
