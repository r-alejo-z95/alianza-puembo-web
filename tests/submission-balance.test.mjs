import test from "node:test";
import assert from "node:assert/strict";

import { getSubmissionBalanceSummary } from "../lib/finance/submission-balance.mjs";

test("shared-payment secondary submissions are fully covered and not reminder eligible", () => {
  const summary = getSubmissionBalanceSummary({
    totalAmount: 100,
    submission: {
      coverage_mode: "covered_by_used_payment",
      form_submission_payments: [
        {
          status: "pending",
          manual_disposition: "duplicado",
          amount_claimed: 100,
          created_at: "2026-05-10T10:00:00.000Z",
        },
      ],
    },
  });

  assert.equal(summary.submittedAmount, 100);
  assert.equal(summary.verifiedAmount, 0);
  assert.equal(summary.remainingBalance, 0);
  assert.equal(summary.isFullyCovered, true);
  assert.equal(summary.isReminderEligible, false);
});

test("scholarship submissions are fully covered and not reminder eligible", () => {
  const summary = getSubmissionBalanceSummary({
    totalAmount: 75,
    submission: {
      coverage_mode: "scholarship",
      form_submission_payments: [],
    },
  });

  assert.equal(summary.submittedAmount, 75);
  assert.equal(summary.remainingBalance, 0);
  assert.equal(summary.isFullyCovered, true);
  assert.equal(summary.isReminderEligible, false);
});

test("cash and card coverage use coverage amount but do not enter bank-transfer reminders", () => {
  const cash = getSubmissionBalanceSummary({
    totalAmount: 50,
    submission: {
      coverage_mode: "cash",
      coverage_amount: 30,
      form_submission_payments: [],
    },
  });

  assert.equal(cash.submittedAmount, 30);
  assert.equal(cash.remainingBalance, 20);
  assert.equal(cash.isReminderEligible, false);

  const card = getSubmissionBalanceSummary({
    totalAmount: 50,
    submission: {
      coverage_mode: "card",
      coverage_amount: 50,
      form_submission_payments: [],
    },
  });

  assert.equal(card.submittedAmount, 50);
  assert.equal(card.remainingBalance, 0);
  assert.equal(card.isReminderEligible, false);
});

test("bank receipt balance counts submitted pending, manual review and verified payments", () => {
  const summary = getSubmissionBalanceSummary({
    totalAmount: 100,
    submission: {
      coverage_mode: "bank_receipt",
      form_submission_payments: [
        { status: "pending", amount_claimed: 10, created_at: "2026-05-01T10:00:00.000Z" },
        { status: "manual_review", extracted_data: { amount: 15 }, created_at: "2026-05-03T10:00:00.000Z" },
        { status: "verified", extracted_data: { amount: 20 }, created_at: "2026-05-02T10:00:00.000Z" },
        { status: "rejected", amount_claimed: 30, created_at: "2026-05-04T10:00:00.000Z" },
        { status: "pending", amount_claimed: 40, manual_disposition: "incorrecto", created_at: "2026-05-05T10:00:00.000Z" },
        { status: "pending", amount_claimed: 50, manual_disposition: "duplicado", created_at: "2026-05-06T10:00:00.000Z" },
      ],
    },
  });

  assert.equal(summary.submittedAmount, 45);
  assert.equal(summary.verifiedAmount, 20);
  assert.equal(summary.remainingBalance, 55);
  assert.equal(summary.hasPendingVerification, true);
  assert.equal(summary.isFullyCovered, false);
  assert.equal(summary.isReminderEligible, true);
  assert.equal(summary.lastPaymentCreatedAt, "2026-05-03T10:00:00.000Z");
});

test("bank receipt balance is capped at zero when submitted amount exceeds total", () => {
  const summary = getSubmissionBalanceSummary({
    totalAmount: 30,
    submission: {
      form_submission_payments: [
        { status: "pending", amount_claimed: 40, created_at: "2026-05-01T10:00:00.000Z" },
      ],
    },
  });

  assert.equal(summary.submittedAmount, 40);
  assert.equal(summary.remainingBalance, 0);
  assert.equal(summary.isFullyCovered, true);
  assert.equal(summary.isReminderEligible, false);
});

test("payment group balance uses shared expected amount and counts group payments once", () => {
  const summary = getSubmissionBalanceSummary({
    totalAmount: 120,
    submission: {
      coverage_mode: "covered_by_used_payment",
      payment_group: {
        expected_amount: 195,
        form_submission_payments: [
          {
            status: "pending",
            amount_claimed: 97.5,
            created_at: "2026-05-10T10:00:00.000Z",
          },
          {
            status: "pending",
            amount_claimed: 97.5,
            manual_disposition: "duplicado",
            created_at: "2026-05-10T10:01:00.000Z",
          },
        ],
      },
      form_submission_payments: [
        {
          status: "pending",
          amount_claimed: 97.5,
          manual_disposition: "duplicado",
          created_at: "2026-05-10T10:01:00.000Z",
        },
      ],
    },
  });

  assert.equal(summary.coverageMode, "payment_group");
  assert.equal(summary.totalAmount, 195);
  assert.equal(summary.submittedAmount, 97.5);
  assert.equal(summary.verifiedAmount, 0);
  assert.equal(summary.remainingBalance, 97.5);
  assert.equal(summary.isFullyCovered, false);
  assert.equal(summary.isReminderEligible, true);
  assert.equal(summary.hasPendingVerification, true);
});

test("payment group without expected amount keeps balance open but does not invent totals", () => {
  const summary = getSubmissionBalanceSummary({
    totalAmount: 120,
    submission: {
      payment_group: {
        expected_amount: null,
        form_submission_payments: [
          {
            status: "verified",
            amount_claimed: 97.5,
            created_at: "2026-05-10T10:00:00.000Z",
          },
        ],
      },
    },
  });

  assert.equal(summary.coverageMode, "payment_group");
  assert.equal(summary.totalAmount, 0);
  assert.equal(summary.submittedAmount, 97.5);
  assert.equal(summary.verifiedAmount, 97.5);
  assert.equal(summary.remainingBalance, null);
  assert.equal(summary.isFullyCovered, false);
  assert.equal(summary.isReminderEligible, false);
  assert.equal(summary.needsExpectedAmount, true);
});
