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
    "CONCILIADO",
    "PENDIENTE",
    "TARJETA",
  ]);
  assert.equal(report.rows[1].bank, "Pichincha");
  assert.equal(report.rows[1].name, "Juan Perez");
  assert.equal(report.rows[1].reference, "NUT123");
  assert.equal(report.rows[1].receiptPath, "finance_receipts/bank.png");
});

test("buildFinanceIncomeReport resolves receiver account from each reconciled bank movement and sorts by registrant", () => {
  const report = buildFinanceIncomeReport({
    formTitle: "Retiro",
    bankAccount: {
      id: "fallback-account",
      bank_name: "Banco Fallback",
      account_type: "Corriente",
      account_number: "000",
    },
    bankAccounts: [
      {
        id: "acc-ahorros",
        bank_name: "Banco Pichincha",
        account_type: "Ahorros",
        account_number: "111222333",
      },
      {
        id: "acc-corriente",
        bank_name: "Banco Guayaquil",
        account_type: "Corriente",
        account_number: "444555666",
      },
    ],
    bankTransactions: [
      { id: "tx-2", bank_account_id: "acc-corriente" },
      { id: "tx-1", bank_account_id: "acc-ahorros" },
    ],
    submissions: [
      {
        created_at: "2026-03-02T10:00:00.000Z",
        data: { "Nombre y Apellido": "Zoe Mora" },
        form_submission_payments: [
          {
            receipt_path: "finance_receipts/zoe.png",
            status: "verified",
            bank_transaction_id: "tx-2",
            extracted_data: {
              amount: 75,
              date: "2026-03-04",
              sender_name: "Empresa Zoe",
            },
          },
        ],
      },
      {
        created_at: "2026-03-01T10:00:00.000Z",
        data: { "Nombre y Apellido": "Ana Vera" },
        form_submission_payments: [
          {
            receipt_path: "finance_receipts/ana.png",
            status: "verified",
            bank_transaction_id: "tx-1",
            extracted_data: {
              amount: 50,
              date: "2026-03-03",
              sender_name: "Papa Ana",
            },
          },
        ],
      },
    ],
  });

  assert.deepEqual(report.rows.map((row) => row.registrantName), ["Ana Vera", "Zoe Mora"]);
  assert.equal(report.rows[0].payerName, "Papa Ana");
  assert.equal(report.rows[0].bank, "Banco Pichincha");
  assert.equal(report.rows[0].accountType, "Ahorros");
  assert.equal(report.rows[0].accountNumber, "111222333");
  assert.equal(report.rows[1].bank, "Banco Guayaquil");
  assert.equal(report.rows[1].accountType, "Corriente");
  assert.equal(report.rows[1].accountNumber, "444555666");
});
