import test from "node:test";
import assert from "node:assert/strict";

import { isFinancialReceiptField } from "../lib/finance/financial-field.mjs";

test("matches the configured financial field by stable field id", () => {
  const form = {
    is_financial: true,
    financial_field_id: "receipt-field-id",
    financial_field_label: "Comprobante",
    form_fields: [{ id: "receipt-field-id", label: "Comprobante de pago" }],
  };

  const fieldDef = { id: "receipt-field-id", label: "Comprobante de pago" };

  assert.equal(
    isFinancialReceiptField({ form, fieldDef, key: "receipt-field-id" }),
    true,
  );
});

test("matches legacy financial fields by label when id is unavailable", () => {
  const form = {
    is_financial: true,
    financial_field_id: null,
    financial_field_label: "Comprobante",
    form_fields: [],
  };

  const fieldDef = { id: "random-id", label: "Comprobante" };

  assert.equal(
    isFinancialReceiptField({ form, fieldDef, key: "random-id" }),
    true,
  );
});

test("does not match unrelated file fields in financial forms", () => {
  const form = {
    is_financial: true,
    financial_field_id: "receipt-field-id",
    financial_field_label: "Comprobante",
    form_fields: [{ id: "receipt-field-id", label: "Comprobante" }],
  };

  const fieldDef = { id: "attachment-id", label: "Autorizacion" };

  assert.equal(
    isFinancialReceiptField({ form, fieldDef, key: "attachment-id" }),
    false,
  );
});
