function toAmount(value) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}

function formatUsdAmount(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(toAmount(amount));
}

function getManualPaymentMethodLabel(method) {
  if (method === "cash") return "Efectivo";
  if (method === "card") return "Tarjeta";
  if (method === "scholarship") return "Beca";
  return "Pago manual";
}

export function isManualPaymentValue(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      value._type === "manual_payment",
  );
}

export function buildManualPaymentValue(method, amount) {
  const normalizedAmount = method === "scholarship" ? 0 : toAmount(amount);
  return {
    _type: "manual_payment",
    label: `${getManualPaymentMethodLabel(method)} - ${formatUsdAmount(normalizedAmount)}`,
    method,
    amount: normalizedAmount,
    is_manual: true,
    status: "validated",
  };
}

export function applyManualPaymentToSubmission({
  form,
  data = {},
  answers = [],
  coverageMode,
  coverageAmount,
}) {
  const financialField = (form?.form_fields || []).find((field) => field.id === form?.financial_field_id);
  const fieldId = financialField?.id ?? form?.financial_field_id ?? null;
  const fieldLabel = financialField?.label ?? form?.financial_field_label ?? null;

  if (!fieldId || !fieldLabel) {
    return { data, answers };
  }

  const manualPaymentValue = buildManualPaymentValue(coverageMode, coverageAmount);

  return {
    data: {
      ...data,
      [fieldLabel]: manualPaymentValue,
    },
    answers: [
      ...answers,
      {
        field_id: fieldId,
        key: fieldId,
        label: fieldLabel,
        value: manualPaymentValue,
        order_index: financialField?.order_index ?? 0,
      },
    ],
  };
}

export function getValueDisplayText(value) {
  if (Array.isArray(value)) return value.join(", ");
  if (isManualPaymentValue(value)) return value.label;
  if (value && typeof value === "object") {
    return value.name || value.label || value.url || JSON.stringify(value);
  }
  return String(value ?? "");
}

export function getSubmissionTrackingPayments(submission) {
  const payments = Array.isArray(submission?.form_submission_payments)
    ? [...submission.form_submission_payments]
    : [];

  if (!["cash", "card", "scholarship"].includes(submission?.coverage_mode || "")) {
    return payments;
  }

  payments.push({
    id: "manual-coverage-payment",
    amount_claimed: submission?.coverage_mode === "scholarship" ? 0 : toAmount(submission?.coverage_amount),
    created_at: submission?.coverage_created_at || submission?.created_at || new Date().toISOString(),
    extracted_data: {
      amount: submission?.coverage_mode === "scholarship" ? 0 : toAmount(submission?.coverage_amount),
      method: submission?.coverage_mode,
      label: buildManualPaymentValue(submission?.coverage_mode, submission?.coverage_amount).label,
      is_manual: true,
    },
    receipt_path: submission?.coverage_backup_path || null,
    status: "verified",
  });

  return payments;
}
