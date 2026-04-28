function toAmount(value) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}

function formatDate(value) {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Guayaquil",
  }).format(date);
}

function formatAmount(value) {
  return `$${toAmount(value).toFixed(2)}`;
}

function statusLabel(status) {
  if (status === "verified") return "Conciliado";
  if (status === "pending") return "Pendiente";
  if (status === "manual_review") return "En revision";
  return String(status || "Sin estado");
}

function activePayments(submission) {
  return (Array.isArray(submission?.form_submission_payments)
    ? submission.form_submission_payments
    : [])
    .filter((payment) => !payment?.manual_disposition)
    .sort((a, b) => {
      const aDate = a?.extracted_data?.date || a?.created_at || "";
      const bDate = b?.extracted_data?.date || b?.created_at || "";
      return new Date(aDate || 0) - new Date(bDate || 0);
    });
}

function paymentSummaryLine(payment, index) {
  const data = payment?.extracted_data || {};
  const parts = [
    `${index + 1}. ${formatDate(data.date || payment?.created_at)}`,
    formatAmount(data.amount ?? payment?.amount_claimed),
    statusLabel(payment?.status),
    data.sender_name ? String(data.sender_name).trim() : "",
  ].filter(Boolean);

  return parts.join(" - ");
}

export function getFinancialAnalyticsPaymentFilePaths(submissions = []) {
  const paths = new Set();
  for (const submission of submissions || []) {
    for (const payment of activePayments(submission)) {
      if (payment?.receipt_path) paths.add(payment.receipt_path);
    }
  }
  return Array.from(paths);
}

export function buildFinancialAnalyticsPaymentColumns(submissions = [], fileUrlMap = new Map()) {
  const paymentsBySubmissionId = new Map();
  let maxPayments = 0;

  for (const submission of submissions || []) {
    const payments = activePayments(submission);
    paymentsBySubmissionId.set(submission?.id, payments);
    maxPayments = Math.max(maxPayments, payments.length);
  }

  const headers = [
    "Pagos / abonos",
    ...Array.from({ length: maxPayments }, (_, index) => `Comprobante abono ${index + 1}`),
  ];
  const valuesBySubmissionId = new Map();

  for (const submission of submissions || []) {
    const payments = paymentsBySubmissionId.get(submission?.id) || [];
    const summary = payments.map(paymentSummaryLine).join("\n");
    const receiptValues = Array.from({ length: maxPayments }, (_, index) => {
      const path = payments[index]?.receipt_path;
      if (!path) return "";
      const url = fileUrlMap.get(path);
      return url ? { text: `Ver comprobante ${index + 1}`, hyperlink: url } : `Ver comprobante ${index + 1}`;
    });
    valuesBySubmissionId.set(submission?.id, [summary, ...receiptValues]);
  }

  return { headers, valuesBySubmissionId };
}
