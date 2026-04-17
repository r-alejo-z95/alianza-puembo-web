function toAmount(value) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}

function paymentAmount(payment) {
  return toAmount(payment?.extracted_data?.amount ?? payment?.amount_claimed);
}

export function getSubmissionPaymentSummary(payments = []) {
  const activePayments = (payments || []).filter((payment) => !payment?.manual_disposition);

  const totalSubmitted = activePayments
    .filter((payment) => ["pending", "manual_review", "verified"].includes(payment?.status))
    .reduce((sum, payment) => sum + paymentAmount(payment), 0);

  const totalVerified = activePayments
    .filter((payment) => payment?.status === "verified")
    .reduce((sum, payment) => sum + paymentAmount(payment), 0);

  return {
    totalSubmitted,
    totalVerified,
    totalPendingReview: Math.max(totalSubmitted - totalVerified, 0),
  };
}

export function getInstallmentEmailSummary({ totalAmount = 0, payments = [] }) {
  const summary = getSubmissionPaymentSummary(payments);
  return {
    amountPaid: summary.totalSubmitted,
    remainingBalance: Math.max(toAmount(totalAmount) - summary.totalSubmitted, 0),
    hasPendingVerification: summary.totalPendingReview > 0,
  };
}
