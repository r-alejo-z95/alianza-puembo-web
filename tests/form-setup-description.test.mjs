import test from "node:test";
import assert from "node:assert/strict";

import {
  buildPaymentDescription,
  mergeFormDescription,
} from "../lib/forms/setup-description.mjs";

test("mergeFormDescription preserves existing description and appends payment instructions", () => {
  const paymentDescription = buildPaymentDescription(
    {
      is_financial: true,
      payment_type: "single",
      total_amount: 25,
      destination_account_id: "bank-1",
    },
    [
      {
        id: "bank-1",
        bank_name: "Banco Pichincha",
        account_holder: "Iglesia Alianza Puembo",
        account_type: "Corriente",
        account_number: "1234567890",
        ruc: "0991263217001",
      },
    ],
  );

  const merged = mergeFormDescription("<p>Trae tu documento de identidad.</p>", paymentDescription);

  assert.match(merged, /Trae tu documento de identidad/);
  assert.match(merged, /Debes realizar un pago único de \$25\.00\./);
  assert.match(merged, /<strong>Banco:<\/strong> Banco Pichincha/);
  assert.match(merged, /<strong>Titular:<\/strong> Iglesia Alianza Puembo/);
  assert.match(merged, /<strong>Tipo:<\/strong> Corriente/);
  assert.match(merged, /<strong>Cuenta:<\/strong> 1234567890/);
  assert.match(merged, /<strong>RUC:<\/strong> 0991263217001/);
});

test("mergeFormDescription replaces the previous automatic payment block instead of duplicating it", () => {
  const currentDescription = [
    "<p>Trae tu documento de identidad.</p>",
    "<!--AUTO_PAYMENT_DESCRIPTION_START-->",
    "<p>Debes realizar un pago único de $25.00 a Banco Pichincha — Cta. 1234567890.</p>",
    "<!--AUTO_PAYMENT_DESCRIPTION_END-->",
  ].join("");

  const updatedPaymentDescription = buildPaymentDescription(
    {
      is_financial: true,
      payment_type: "installments",
      max_installments: 3,
      total_amount: 60,
      destination_account_id: "bank-1",
    },
    [
      {
        id: "bank-1",
        bank_name: "Banco Guayaquil",
        account_holder: "Iglesia Alianza Puembo",
        account_type: "Ahorros",
        account_number: "555666777",
        ruc: "0991263217001",
      },
    ],
  );

  const merged = mergeFormDescription(currentDescription, updatedPaymentDescription);

  assert.match(merged, /Trae tu documento de identidad/);
  assert.equal((merged.match(/AUTO_PAYMENT_DESCRIPTION_START/g) || []).length, 1);
  assert.doesNotMatch(merged, /\$25\.00/);
  assert.match(merged, /Puedes hacerlo en hasta 3 cuotas/);
});

test("mergeFormDescription removes legacy generated payment copy before appending the new one", () => {
  const currentDescription = [
    "<p>Trae tu documento de identidad.</p>",
    "<p>Debes realizar un pago único de $25.00 a Banco Pichincha — Cta. 1234567890.</p>",
  ].join("");

  const updatedPaymentDescription = buildPaymentDescription(
    {
      is_financial: true,
      payment_type: "single",
      total_amount: 30,
      destination_account_id: "bank-1",
    },
    [
      {
        id: "bank-1",
        bank_name: "Produbanco",
        account_holder: "Iglesia Alianza Puembo",
        account_type: "Corriente",
        account_number: "111222333",
        ruc: "0991263217001",
      },
    ],
  );

  const merged = mergeFormDescription(currentDescription, updatedPaymentDescription);

  assert.equal((merged.match(/Debes realizar un pago/g) || []).length, 1);
  assert.doesNotMatch(merged, /Banco Pichincha/);
  assert.match(merged, /Produbanco/);
});

test("buildPaymentDescription omits account fields that are not available", () => {
  const paymentDescription = buildPaymentDescription(
    {
      is_financial: true,
      payment_type: "single",
      total_amount: 15,
      destination_account_id: "bank-1",
    },
    [
      {
        id: "bank-1",
        bank_name: "Banco Bolivariano",
        account_holder: "",
        account_type: "",
        account_number: "444555666",
        ruc: null,
      },
    ],
  );

  assert.match(paymentDescription, /<strong>Banco:<\/strong> Banco Bolivariano/);
  assert.match(paymentDescription, /<strong>Cuenta:<\/strong> 444555666/);
  assert.doesNotMatch(paymentDescription, /Titular:/);
  assert.doesNotMatch(paymentDescription, /Tipo:/);
  assert.doesNotMatch(paymentDescription, /RUC:/);
});
