import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  detectFinancialSubmissionConflict,
  normalizePersonNameTokens,
} from "../lib/finance/submission-dedupe.mjs";

const existingSubmission = {
  id: "sub-1",
  access_token: "token-1",
  notification_email: "ana@example.com",
  data: { "Nombre completo": "Ana Maria Gomez Perez" },
  answers: [
    { label: "Nombre completo", value: "Ana Maria Gomez Perez" },
  ],
  form_submission_payments: [
    {
      status: "verified",
      extracted_data: {
        amount: 40,
        date: "2026-04-17",
        reference: "TRX998877",
      },
    },
    {
      status: "pending",
      amount_claimed: 20,
      extracted_data: {
        amount: 20,
        date: "2026-04-20",
        reference: "TRX123456",
      },
    },
  ],
};

test("normalizePersonNameTokens tolerates accents, order and short filler tokens", () => {
  assert.deepEqual(
    normalizePersonNameTokens("Ana María Gómez Pérez"),
    ["ana", "gomez", "maria", "perez"],
  );
});

test("detectFinancialSubmissionConflict blocks reused receipt references on active submissions", () => {
  const conflict = detectFinancialSubmissionConflict({
    incoming: {
      notificationEmail: "different@example.com",
      participantName: "Otra Persona",
      receiptData: {
        amount: "40.00",
        date: "2026-04-17",
        reference: "trx-998877",
      },
    },
    existingSubmissions: [existingSubmission],
    totalAmount: 100,
  });

  assert.equal(conflict?.type, "duplicate_receipt");
  assert.equal(conflict?.action, "block");
  assert.equal(conflict?.matchedSubmission.id, "sub-1");
});

test("detectFinancialSubmissionConflict asks for confirmation when a reused receipt can cover another inscription", () => {
  const conflict = detectFinancialSubmissionConflict({
    incoming: {
      notificationEmail: "family@example.com",
      participantName: "Otra Persona",
      receiptData: {
        amount: "40.00",
        date: "2026-04-17",
        reference: "trx-998877",
      },
    },
    existingSubmissions: [existingSubmission],
    totalAmount: 20,
  });

  assert.equal(conflict?.type, "duplicate_receipt");
  assert.equal(conflict?.action, "confirm_shared_payment");
  assert.equal(conflict?.sharedPayment?.eligible, true);
  assert.equal(conflict?.sharedPayment?.capacity, 2);
  assert.equal(conflict?.sharedPayment?.usedSlots, 1);
  assert.equal(conflict?.sharedPayment?.availableSlots, 1);
});

test("detectFinancialSubmissionConflict blocks reused receipts when the shared payment capacity is already used", () => {
  const conflict = detectFinancialSubmissionConflict({
    incoming: {
      notificationEmail: "third@example.com",
      participantName: "Tercera Persona",
      receiptData: {
        amount: "40.00",
        date: "2026-04-17",
        reference: "trx-998877",
      },
    },
    existingSubmissions: [
      existingSubmission,
      {
        id: "sub-2",
        is_archived: false,
        coverage_mode: "covered_by_used_payment",
        covered_by_submission_id: "sub-1",
        form_submission_payments: [],
      },
    ],
    totalAmount: 20,
  });

  assert.equal(conflict?.type, "duplicate_receipt");
  assert.equal(conflict?.action, "block");
  assert.equal(conflict?.sharedPayment?.eligible, false);
  assert.equal(conflict?.sharedPayment?.capacity, 2);
  assert.equal(conflict?.sharedPayment?.usedSlots, 2);
  assert.equal(conflict?.sharedPayment?.availableSlots, 0);
});

test("detectFinancialSubmissionConflict recovers an existing partial inscription by email and fuzzy name", () => {
  const conflict = detectFinancialSubmissionConflict({
    incoming: {
      notificationEmail: " ANA@example.com ",
      participantName: "Ana Gomez",
      receiptData: {
        amount: 15,
        date: "2026-04-22",
        reference: "TRXNEW",
      },
    },
    existingSubmissions: [existingSubmission],
    totalAmount: 100,
  });

  assert.equal(conflict?.type, "existing_partial_registration");
  assert.equal(conflict?.action, "send_tracking_link");
  assert.equal(conflict?.remainingBalance, 40);
});

test("detectFinancialSubmissionConflict does not block on name similarity alone", () => {
  const conflict = detectFinancialSubmissionConflict({
    incoming: {
      notificationEmail: "new@example.com",
      participantName: "Ana Gomez",
      receiptData: {
        amount: 15,
        date: "2026-04-22",
        reference: "TRXNEW",
      },
    },
    existingSubmissions: [existingSubmission],
    totalAmount: 100,
  });

  assert.equal(conflict, null);
});

test("submit action handles financial conflicts before creating new submissions", () => {
  const actions = readFileSync(new URL("../lib/actions.ts", import.meta.url), "utf8");

  assert.match(actions, /detectFinancialSubmissionConflict/);
  assert.match(actions, /sharedPaymentConfirmation/);
  assert.match(actions, /coverage_mode:\s*"covered_by_used_payment"/);
  assert.match(actions, /manual_disposition:\s*sharedPaymentCoverage \? "duplicado" : null/);
  assert.match(actions, /sendSubmissionTrackingLinksEmail/);
  assert.match(actions, /cleanupUploadedFinanceReceipt/);
  assert.match(actions, /outcome:\s*buildSubmissionOutcome/);
});

test("shared payment confirmation copy is friendly and explicit", () => {
  const actions = readFileSync(new URL("../lib/actions.ts", import.meta.url), "utf8");

  assert.match(actions, /¿Quieres usar este mismo pago para esta inscripción\?/);
  assert.match(actions, /puedes vincular esta inscripción al mismo pago sin registrar un ingreso adicional/);
  assert.match(actions, /Sí, usar este mismo pago/);
  assert.doesNotMatch(actions, /¿Este pago cubre a esta persona\?/);
});
