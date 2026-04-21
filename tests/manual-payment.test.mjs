import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  applyManualPaymentToSubmission,
  buildManualPaymentValue,
  getSubmissionTrackingPayments,
  getValueDisplayText,
} from "../lib/finance/manual-payment.mjs";

test("buildManualPaymentValue creates a structured manual payment object", () => {
  assert.deepEqual(buildManualPaymentValue("cash", 25), {
    _type: "manual_payment",
    label: "Efectivo - $25.00",
    method: "cash",
    amount: 25,
    is_manual: true,
    status: "validated",
  });

  assert.deepEqual(buildManualPaymentValue("scholarship", null), {
    _type: "manual_payment",
    label: "Beca - $0.00",
    method: "scholarship",
    amount: 0,
    is_manual: true,
    status: "validated",
  });
});

test("applyManualPaymentToSubmission injects the manual payment into the configured financial field", () => {
  const form = {
    financial_field_id: "receipt",
    financial_field_label: "Comprobante",
    form_fields: [{ id: "receipt", label: "Comprobante de pago" }],
  };

  const result = applyManualPaymentToSubmission({
    form,
    data: { Nombre: "Ramon" },
    answers: [{ field_id: "name", label: "Nombre", value: "Ramon" }],
    coverageMode: "card",
    coverageAmount: 40,
  });

  assert.deepEqual(result.data, {
    Nombre: "Ramon",
    "Comprobante de pago": {
      _type: "manual_payment",
      label: "Tarjeta - $40.00",
      method: "card",
      amount: 40,
      is_manual: true,
      status: "validated",
    },
  });

  assert.equal(result.answers.length, 2);
  assert.deepEqual(result.answers[1], {
    field_id: "receipt",
    key: "receipt",
    label: "Comprobante de pago",
    value: {
      _type: "manual_payment",
      label: "Tarjeta - $40.00",
      method: "card",
      amount: 40,
      is_manual: true,
      status: "validated",
    },
    order_index: 0,
  });
});

test("getValueDisplayText returns the manual payment label", () => {
  assert.equal(
    getValueDisplayText({
      _type: "manual_payment",
      label: "Efectivo - $25.00",
      method: "cash",
      amount: 25,
      is_manual: true,
      status: "validated",
    }),
    "Efectivo - $25.00",
  );
});

test("getSubmissionTrackingPayments exposes manual registrations as verified payments", () => {
  const payments = getSubmissionTrackingPayments({
    coverage_mode: "cash",
    coverage_amount: 18.5,
    coverage_created_at: "2026-04-20T12:00:00.000Z",
    coverage_backup_path: "forms/manual/receipt.png",
    form_submission_payments: [],
  });

  assert.equal(payments.length, 1);
  assert.deepEqual(payments[0], {
    id: "manual-coverage-payment",
    amount_claimed: 18.5,
    created_at: "2026-04-20T12:00:00.000Z",
    extracted_data: {
      amount: 18.5,
      method: "cash",
      label: "Efectivo - $18.50",
      is_manual: true,
    },
    receipt_path: "forms/manual/receipt.png",
    status: "verified",
  });
});

test("manual payment helpers are wired into creation, tracking and analytics flows", () => {
  const financeActions = readFileSync(new URL("../lib/actions/finance.ts", import.meta.url), "utf8");
  const trackingClient = readFileSync(new URL("../app/inscripcion/[token]/TrackingClient.jsx", import.meta.url), "utf8");
  const analyticsDashboard = readFileSync(new URL("../components/admin/managers/AnalyticsDashboard.jsx", import.meta.url), "utf8");

  assert.match(financeActions, /applyManualPaymentToSubmission/);
  assert.match(financeActions, /await revalidateFormSubmissions\(payload\.formId\)/);
  assert.match(financeActions, /revalidatePath\(`\/inscripcion\/\$\{data\.access_token\}`\)/);
  assert.match(trackingClient, /getSubmissionTrackingPayments/);
  assert.match(analyticsDashboard, /getValueDisplayText/);
});
