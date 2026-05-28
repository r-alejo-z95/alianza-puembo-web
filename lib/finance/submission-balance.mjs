const ACTIVE_PAYMENT_STATUSES = new Set(["pending", "manual_review", "verified"]);

function toAmount(value) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? Math.abs(amount) : 0;
}

function paymentAmount(payment) {
  return toAmount(payment?.extracted_data?.amount ?? payment?.amount_claimed);
}

function normalizeIsoDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function latestIsoDate(values) {
  const dates = values
    .map(normalizeIsoDate)
    .filter(Boolean)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return dates[0] || null;
}

function activePayments(payments = []) {
  return (payments || []).filter(
    (payment) =>
      !payment?.manual_disposition &&
      ACTIVE_PAYMENT_STATUSES.has(payment?.status),
  );
}

function getPaymentGroup(submission = {}) {
  const group = submission?.payment_group || submission?.payment_groups || null;
  if (Array.isArray(group)) return group[0] || null;
  return group && typeof group === "object" ? group : null;
}

export function getSubmissionBalanceSummary({ submission = {}, totalAmount = 0 } = {}) {
  const paymentGroup = getPaymentGroup(submission);
  if (paymentGroup) {
    const groupPayments = Array.isArray(paymentGroup.form_submission_payments)
      ? paymentGroup.form_submission_payments
      : Array.isArray(paymentGroup.payments)
        ? paymentGroup.payments
        : [];
    const usablePayments = activePayments(groupPayments);
    const submittedAmount = usablePayments.reduce(
      (sum, payment) => sum + paymentAmount(payment),
      0,
    );
    const verifiedAmount = usablePayments
      .filter((payment) => payment?.status === "verified")
      .reduce((sum, payment) => sum + paymentAmount(payment), 0);
    const expectedAmount = toAmount(paymentGroup.expected_amount);
    const hasExpectedAmount = expectedAmount > 0;
    const remainingBalance = hasExpectedAmount
      ? Math.max(expectedAmount - submittedAmount, 0)
      : null;

    return {
      totalAmount: hasExpectedAmount ? expectedAmount : 0,
      submittedAmount,
      verifiedAmount,
      remainingBalance,
      hasPendingVerification: submittedAmount > verifiedAmount,
      isFullyCovered: hasExpectedAmount ? remainingBalance <= 0 : false,
      isReminderEligible: hasExpectedAmount ? remainingBalance > 0 : false,
      coverageMode: "payment_group",
      needsExpectedAmount: !hasExpectedAmount,
      paymentGroupId: paymentGroup.id || submission?.payment_group_id || null,
      lastPaymentCreatedAt: latestIsoDate(
        usablePayments.map((payment) => payment?.created_at),
      ),
    };
  }

  const coverageMode = submission?.coverage_mode || "bank_receipt";
  const normalizedTotal = Math.max(toAmount(totalAmount), 0);
  const payments = Array.isArray(submission?.form_submission_payments)
    ? submission.form_submission_payments
    : [];

  if (coverageMode === "scholarship" || coverageMode === "covered_by_used_payment") {
    return {
      totalAmount: normalizedTotal,
      submittedAmount: normalizedTotal,
      verifiedAmount: coverageMode === "covered_by_used_payment" ? 0 : normalizedTotal,
      remainingBalance: 0,
      hasPendingVerification: coverageMode === "covered_by_used_payment",
      isFullyCovered: true,
      isReminderEligible: false,
      coverageMode,
      lastPaymentCreatedAt: latestIsoDate(payments.map((payment) => payment?.created_at)),
    };
  }

  if (coverageMode === "cash" || coverageMode === "card") {
    const submittedAmount = Math.max(toAmount(submission?.coverage_amount), 0);
    const remainingBalance = Math.max(normalizedTotal - submittedAmount, 0);

    return {
      totalAmount: normalizedTotal,
      submittedAmount,
      verifiedAmount: submittedAmount,
      remainingBalance,
      hasPendingVerification: false,
      isFullyCovered: remainingBalance <= 0,
      isReminderEligible: false,
      coverageMode,
      lastPaymentCreatedAt: latestIsoDate(payments.map((payment) => payment?.created_at)),
    };
  }

  const usablePayments = activePayments(payments);
  const submittedAmount = usablePayments.reduce(
    (sum, payment) => sum + paymentAmount(payment),
    0,
  );
  const verifiedAmount = usablePayments
    .filter((payment) => payment?.status === "verified")
    .reduce((sum, payment) => sum + paymentAmount(payment), 0);
  const remainingBalance = Math.max(normalizedTotal - submittedAmount, 0);

  return {
    totalAmount: normalizedTotal,
    submittedAmount,
    verifiedAmount,
    remainingBalance,
    hasPendingVerification: submittedAmount > verifiedAmount,
    isFullyCovered: remainingBalance <= 0,
    isReminderEligible: remainingBalance > 0,
    coverageMode,
    lastPaymentCreatedAt: latestIsoDate(
      usablePayments.map((payment) => payment?.created_at),
    ),
  };
}
