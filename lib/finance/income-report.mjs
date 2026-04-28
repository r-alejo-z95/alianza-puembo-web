function toAmount(value) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}

function cleanText(value) {
  return String(value ?? "").trim();
}

function normalizeKey(value) {
  return cleanText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function findNameInReportSubmission(submission) {
  const data = submission?.data && typeof submission.data === "object" ? submission.data : {};
  const answers = Array.isArray(submission?.answers) ? submission.answers : [];
  const entries = [
    ...answers.map((answer, index) => ({
      key: normalizeKey(answer?.label || answer?.key || `answer ${index}`),
      value: cleanText(answer?.value),
    })),
    ...Object.entries(data).map(([key, value]) => ({
      key: normalizeKey(key),
      value: cleanText(value),
    })),
  ].filter((entry) => entry.value && !entry.value.includes("http") && !entry.value.includes("@"));

  const preferred = [
    "nombre y apellido",
    "nombre completo",
    "nombres y apellidos",
    "nombre del participante",
    "nombre del inscrito",
    "participante",
    "inscrito",
  ];

  for (const pattern of preferred) {
    const found = entries.find((entry) => entry.key.includes(pattern));
    if (found) return found.value;
  }

  return entries.find((entry) => entry.key.includes("nombre"))?.value || "Inscrito";
}

function paymentAmount(payment) {
  return toAmount(payment?.extracted_data?.amount ?? payment?.amount_claimed);
}

function isActivePayment(payment) {
  return !payment?.manual_disposition;
}

function buildLookupById(items = []) {
  const lookup = new Map();
  for (const item of items || []) {
    if (item?.id) lookup.set(item.id, item);
  }
  return lookup;
}

function resolvePaymentAccount(payment, { bankAccount, bankAccountById, bankTransactionById }) {
  const transaction = payment?.bank_transaction_id
    ? bankTransactionById.get(payment.bank_transaction_id)
    : null;
  const accountId =
    transaction?.bank_account_id ||
    transaction?.account_id ||
    transaction?.bank_reports?.bank_account_id ||
    transaction?.bank_reports?.account_id ||
    null;

  return (accountId ? bankAccountById.get(accountId) : null) || bankAccount || null;
}

function buildBankRow({ payment, submission, formTitle, bankAccount, bankAccountById, bankTransactionById }) {
  const data = payment?.extracted_data || {};
  const amount = paymentAmount(payment);
  const isVerified = payment?.status === "verified";
  const isPending = ["pending", "manual_review"].includes(payment?.status);
  const receiverAccount = resolvePaymentAccount(payment, {
    bankAccount,
    bankAccountById,
    bankTransactionById,
  });
  const registrantName = findNameInReportSubmission(submission);
  const payerName = cleanText(data.sender_name);

  return {
    date: data.date || payment?.created_at || submission?.created_at || null,
    bank: cleanText(receiverAccount?.bank_name),
    accountType: cleanText(receiverAccount?.account_type),
    accountNumber: cleanText(receiverAccount?.account_number),
    registrantName,
    payerName,
    name: payerName || registrantName,
    concept: cleanText(formTitle).toUpperCase(),
    amount,
    confirmedAmount: isVerified ? amount : 0,
    eventTotal: 0,
    observation: isVerified ? "CONCILIADO" : isPending ? "PENDIENTE" : cleanText(payment?.status).toUpperCase(),
    reference: cleanText(data.reference),
    receiptPath: payment?.receipt_path || null,
    paymentStatus: payment?.status || null,
  };
}

function buildManualRow({ submission, formTitle, bankAccount, mode }) {
  const amount = toAmount(submission?.coverage_amount);
  const label = mode === "cash" ? "EFECTIVO" : "TARJETA";
  const registrantName = findNameInReportSubmission(submission);

  return {
    date: submission?.coverage_created_at || submission?.created_at || null,
    bank: label,
    accountType: cleanText(bankAccount?.account_type),
    accountNumber: cleanText(bankAccount?.account_number),
    registrantName,
    payerName: "",
    name: registrantName,
    concept: cleanText(formTitle).toUpperCase(),
    amount,
    confirmedAmount: amount,
    eventTotal: 0,
    observation: label,
    reference: "",
    receiptPath: submission?.coverage_backup_path || null,
    paymentStatus: "verified",
  };
}

export function buildFinanceIncomeReport({
  formTitle = "Ingresos",
  bankAccount = null,
  bankAccounts = [],
  bankTransactions = [],
  submissions = [],
} = {}) {
  const rows = [];
  const bankAccountById = buildLookupById(bankAccounts);
  const bankTransactionById = buildLookupById(bankTransactions);

  for (const submission of submissions || []) {
    const coverageMode = submission?.coverage_mode || "bank_receipt";

    if (coverageMode === "cash" || coverageMode === "card") {
      rows.push(buildManualRow({ submission, formTitle, bankAccount, mode: coverageMode }));
      continue;
    }

    if (coverageMode === "scholarship" || coverageMode === "covered_by_used_payment") {
      continue;
    }

    const payments = Array.isArray(submission?.form_submission_payments)
      ? submission.form_submission_payments
      : [];

    payments.filter(isActivePayment).forEach((payment) => {
      if (!["pending", "manual_review", "verified"].includes(payment?.status)) return;
      rows.push(buildBankRow({
        payment,
        submission,
        formTitle,
        bankAccount,
        bankAccountById,
        bankTransactionById,
      }));
    });
  }

  rows.sort((a, b) => {
    const nameCompare = cleanText(a.registrantName).localeCompare(cleanText(b.registrantName), "es", {
      sensitivity: "base",
    });
    if (nameCompare !== 0) return nameCompare;
    return new Date(a.date || 0) - new Date(b.date || 0);
  });

  const summary = rows.reduce(
    (acc, row) => {
      if (row.observation === "EFECTIVO") acc.cashTotal += row.confirmedAmount;
      if (row.observation === "TARJETA") acc.cardTotal += row.confirmedAmount;
      if (row.observation === "CONCILIADO") acc.bankVerifiedTotal += row.confirmedAmount;
      if (row.observation === "PENDIENTE") acc.pendingTotal += row.amount;
      acc.confirmedTotal += row.confirmedAmount;
      return acc;
    },
    {
      confirmedTotal: 0,
      cashTotal: 0,
      cardTotal: 0,
      bankVerifiedTotal: 0,
      pendingTotal: 0,
    },
  );

  rows.forEach((row, index) => {
    row.eventTotal = index === 0 ? summary.confirmedTotal : 0;
  });

  return { rows, summary };
}
