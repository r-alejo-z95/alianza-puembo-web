import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  buildActiveReconciledTransactionIds,
  collectFinanceReceiptPathsFromSubmission,
} from "../lib/finance/submission-lifecycle.mjs";

test("buildActiveReconciledTransactionIds ignores payments from archived submissions", () => {
  const reconciledIds = buildActiveReconciledTransactionIds([
    {
      bank_transaction_id: "tx-active",
      form_submissions: { is_archived: false },
    },
    {
      bank_transaction_id: "tx-archived",
      form_submissions: { is_archived: true },
    },
    {
      bank_transaction_id: null,
      form_submissions: { is_archived: false },
    },
  ]);

  assert.deepEqual([...reconciledIds], ["tx-active"]);
});

test("collectFinanceReceiptPathsFromSubmission finds every storage object tied to a response", () => {
  const paths = collectFinanceReceiptPathsFromSubmission({
    coverage_backup_path: "finance_receipts/manual/cash.png",
    data: {
      receipt: {
        _type: "file",
        financial_receipt_path: "finance_receipts/form/main.png",
      },
      nested: {
        value: {
          financial_receipt_path: "finance_receipts/form/nested.pdf",
        },
      },
      unsafe: {
        financial_receipt_path: "../secret.png",
      },
    },
    answers: [
      {
        value: {
          financial_receipt_path: "finance_receipts/form/main.png",
        },
      },
      {
        value: {
          path: "finance_receipts/form/answer-only.jpg",
        },
      },
    ],
    form_submission_payments: [
      { receipt_path: "finance_receipts/form/payment-1.jpg" },
      { receipt_path: "event-posters/not-finance.jpg" },
    ],
  });

  assert.deepEqual(paths, [
    "manual/cash.png",
    "form/main.png",
    "form/nested.pdf",
    "form/answer-only.jpg",
    "form/payment-1.jpg",
  ]);
});

test("finance actions wire active reconciliation and permanent storage cleanup", () => {
  const financeActions = readFileSync(new URL("../lib/actions/finance.ts", import.meta.url), "utf8");
  const formActions = readFileSync(new URL("../lib/actions/forms.ts", import.meta.url), "utf8");
  const formsData = readFileSync(new URL("../lib/data/forms.ts", import.meta.url), "utf8");

  assert.match(financeActions, /form_submissions!inner\(is_archived\)/);
  assert.match(financeActions, /buildActiveReconciledTransactionIds/);
  assert.match(formActions, /collectFinanceReceiptPathsFromSubmission/);
  assert.match(formActions, /\.storage\s*[\s\S]*\.from\("finance_receipts"\)\s*[\s\S]*\.remove\(/);
  assert.match(formsData, /getSubmissionByToken[\s\S]*\.eq\("is_archived", false\)/);
});
