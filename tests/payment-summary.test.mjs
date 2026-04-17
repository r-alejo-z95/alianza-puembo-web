import test from "node:test";
import assert from "node:assert/strict";

import {
  getSubmissionPaymentSummary,
  getInstallmentEmailSummary,
} from "../lib/finance/payment-summary.mjs";

test("getSubmissionPaymentSummary separates submitted and verified amounts", () => {
  const payments = [
    { status: "pending", amount_claimed: 25 },
    { status: "manual_review", extracted_data: { amount: 10 } },
    { status: "verified", extracted_data: { amount: 15 } },
  ];

  assert.deepEqual(getSubmissionPaymentSummary(payments), {
    totalSubmitted: 50,
    totalVerified: 15,
    totalPendingReview: 35,
  });
});

test("getInstallmentEmailSummary uses submitted payments to compute pending balance", () => {
  const payments = [
    { status: "pending", amount_claimed: 30 },
    { status: "verified", extracted_data: { amount: 20 } },
  ];

  assert.deepEqual(getInstallmentEmailSummary({ totalAmount: 100, payments }), {
    amountPaid: 50,
    remainingBalance: 50,
    hasPendingVerification: true,
  });
});
