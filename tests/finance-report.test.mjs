import test from "node:test";
import assert from "node:assert/strict";

import {
  buildFinanceIncomeReport,
} from "../lib/finance/income-report.mjs";

test("buildFinanceIncomeReport totals confirmed revenue and preserves receipt links", () => {
  const report = buildFinanceIncomeReport({
    formTitle: "EJE",
    bankAccount: {
      bank_name: "Pichincha",
      account_type: "A",
      account_number: "2208033009",
    },
    submissions: [
      {
        created_at: "2026-03-01T10:00:00.000Z",
        coverage_mode: "cash",
        coverage_amount: 20,
        coverage_backup_path: "finance_receipts/cash.png",
        data: { "Nombre y Apellido": "Ana Guerra" },
        form_submission_payments: [],
      },
      {
        created_at: "2026-03-02T10:00:00.000Z",
        coverage_mode: "card",
        coverage_amount: "15.50",
        data: { "Nombre y Apellido": "Marco Vega" },
        form_submission_payments: [],
      },
      {
        created_at: "2026-03-03T10:00:00.000Z",
        data: { "Nombre y Apellido": "Lucia Perez" },
        form_submission_payments: [
          {
            receipt_path: "finance_receipts/bank.png",
            status: "verified",
            bank_transaction_id: "tx-1",
            extracted_data: {
              amount: 100,
              date: "2026-03-03",
              bank_name: "Banco del Pacifico",
              sender_name: "Juan Perez",
              reference: "NUT123",
            },
          },
          {
            receipt_path: "finance_receipts/pending.png",
            status: "pending",
            extracted_data: {
              amount: 50,
              date: "2026-03-04",
              sender_name: "Pendiente User",
            },
          },
        ],
      },
      {
        created_at: "2026-03-05T10:00:00.000Z",
        coverage_mode: "scholarship",
        coverage_amount: 80,
        data: { "Nombre y Apellido": "Beca User" },
        form_submission_payments: [],
      },
    ],
  });

  assert.equal(report.summary.confirmedTotal, 135.5);
  assert.equal(report.summary.cashTotal, 20);
  assert.equal(report.summary.cardTotal, 15.5);
  assert.equal(report.summary.bankVerifiedTotal, 100);
  assert.equal(report.summary.pendingTotal, 50);
  assert.equal(report.rows.length, 4);

  assert.deepEqual(report.rows.map((row) => row.observation), [
    "EFECTIVO",
    "TARJETA",
    "CONCILIADO",
    "PENDIENTE",
  ]);
  assert.equal(report.rows[2].bank, "Banco del Pacifico");
  assert.equal(report.rows[2].name, "Juan Perez");
  assert.equal(report.rows[2].reference, "NUT123");
  assert.equal(report.rows[2].receiptPath, "finance_receipts/bank.png");
});
