import test from "node:test";
import assert from "node:assert/strict";

const { classifyFinancialReceipt } = await import("../lib/services/receipt-validation.ts");
const {
  extractReceiptDataWithModel,
  isRetryableGeminiError,
} = await import("../lib/services/ai-reconciliation.ts");
const { compareReceiptBeneficiary } = await import("../lib/services/receipt-validation.ts");

test("production receipt validation keeps unmatched beneficiary receipts in manual review", () => {
  const result = classifyFinancialReceipt(
    {
      amount: 99,
      date: "2026-04-17",
      reference: "TRX554433",
      description: "Transferencia exitosa",
      sender_name: "Maria Gomez",
      bank_name: "Banco Pichincha",
      beneficiary_name: "Iglesia Evangelica Ecuatoriana",
      beneficiary_account: "9104",
      currency: "USD",
      is_valid_receipt: true,
      is_correct_beneficiary: true,
    },
    {
      bank_name: "Pichincha",
      account_holder: null,
      account_number: "2208033009",
    },
  );

  assert.equal(result.status, "manual_review");
});

test("production receipt validation rejects identity documents", () => {
  const result = classifyFinancialReceipt(
    {
      amount: null,
      date: null,
      reference: "1723456789",
      description: "Cedula de ciudadania",
      sender_name: "Juan Perez",
      bank_name: null,
      beneficiary_name: null,
      beneficiary_account: null,
      currency: null,
      is_valid_receipt: false,
      is_correct_beneficiary: false,
      document_kind: "identity_document",
      operation_type: "unknown",
      receipt_confidence: "low",
      rejection_signals: ["cedula"],
      bank_signals: [],
      ocr_summary: "cedula de ciudadania nombres apellidos numero de identificacion",
    },
    {
      bank_name: "Pichincha",
      account_holder: null,
      account_number: "2208033009",
    },
  );

  assert.equal(result.status, "invalid");
});

test("production receipt validation rejects invoices even with church metadata", () => {
  const result = classifyFinancialReceipt(
    {
      amount: 25,
      date: "2026-04-17",
      reference: "001-002-000123456",
      description: "Factura de servicios",
      sender_name: null,
      bank_name: null,
      beneficiary_name: "Iglesia Alianza Puembo",
      beneficiary_account: null,
      currency: "USD",
      is_valid_receipt: true,
      is_correct_beneficiary: true,
      document_kind: "invoice",
      operation_type: "payment",
      receipt_confidence: "medium",
      rejection_signals: ["factura", "iva"],
      bank_signals: [],
      ocr_summary: "factura sri cliente iglesia alianza puembo subtotal iva total",
    },
    {
      bank_name: "Pichincha",
      account_holder: null,
      account_number: "2208033009",
    },
  );

  assert.equal(result.status, "invalid");
});

test("production receipt validation accepts a strong bank receipt with account match", () => {
  const result = classifyFinancialReceipt(
    {
      amount: 40,
      date: "2026-04-17",
      reference: "TRX998877",
      description: "Transferencia exitosa",
      sender_name: "Maria Gomez",
      bank_name: "Banco Pichincha",
      beneficiary_name: "Iglesia Alianza Puembo",
      beneficiary_account: "2208033009",
      currency: "USD",
      is_valid_receipt: true,
      is_correct_beneficiary: true,
      document_kind: "bank_receipt",
      operation_type: "transfer",
      receipt_confidence: "high",
      rejection_signals: [],
      bank_signals: ["transferencia", "comprobante", "banco"],
      ocr_summary: "comprobante de transferencia exitosa banco pichincha alianza puembo referencia trx998877",
    },
    {
      bank_name: "Pichincha",
      account_holder: null,
      account_number: "2208033009",
    },
  );

  assert.equal(result.status, "valid");
});

test("beneficiary account matching recognizes masked and truncated account variants", () => {
  const variants = [
    "XXXX009",
    "220XXXX3009",
    "XXXXXX3009",
    "2XXXXX3009",
    "3009",
    "*** *** 3009",
    "2•••••••009",
  ];

  for (const beneficiary_account of variants) {
    const result = compareReceiptBeneficiary(
      {
        amount: 40,
        date: "2026-04-17",
        reference: "TRX998877",
        description: "Transferencia exitosa",
        sender_name: "Maria Gomez",
        bank_name: "Banco Pichincha",
        beneficiary_name: "Iglesia",
        beneficiary_account,
        currency: "USD",
        is_valid_receipt: true,
        is_correct_beneficiary: true,
        document_kind: "bank_receipt",
        operation_type: "transfer",
        receipt_confidence: "high",
        rejection_signals: [],
        bank_signals: ["transferencia", "comprobante", "banco"],
        ocr_summary: "comprobante bancario",
      },
      {
        bank_name: "Pichincha",
        account_holder: null,
        account_number: "2208033009",
      },
    );

    assert.equal(result.matched, true, `variant ${beneficiary_account} should match`);
  }
});

test("retries transient Gemini failures and succeeds on a later attempt", async () => {
  let attempts = 0;
  const fakeModel = {
    async generateContent() {
      attempts += 1;
      if (attempts < 3) {
        throw new Error("[503 Service Unavailable] high demand");
      }
      return {
        response: {
          text() {
            return JSON.stringify({
              amount: 25,
              date: "2026-04-17",
              reference: "ABC123",
              description: "Transferencia",
              sender_name: "Juan",
              bank_name: "Pichincha",
              beneficiary_name: "Iglesia",
              beneficiary_account: "2208033009",
              currency: "USD",
              is_valid_receipt: true,
              is_correct_beneficiary: true,
            });
          },
        },
      };
    },
  };

  const result = await extractReceiptDataWithModel(fakeModel, "ZmFrZQ==", "image/jpeg");

  assert.equal(attempts, 3);
  assert.equal(result.transientFailure, false);
  assert.equal(result.data.amount, 25);
});

test("marks extraction as transient failure when Gemini keeps returning 503", async () => {
  const fakeModel = {
    async generateContent() {
      throw new Error("[503 Service Unavailable] high demand");
    },
  };

  const result = await extractReceiptDataWithModel(fakeModel, "ZmFrZQ==", "image/jpeg");

  assert.equal(result.transientFailure, true);
  assert.equal(result.data, null);
});

test("identifies retryable Gemini errors", () => {
  assert.equal(isRetryableGeminiError(new Error("[503 Service Unavailable] high demand")), true);
  assert.equal(isRetryableGeminiError(new Error("[429 Too Many Requests] rate limit")), true);
  assert.equal(isRetryableGeminiError(new Error("[400 Bad Request] invalid mime")), false);
});
