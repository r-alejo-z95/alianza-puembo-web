import test from "node:test";
import assert from "node:assert/strict";

const {
  classifyFinancialReceipt,
  resolveFinancialReceiptValidation,
} = await import("../lib/services/receipt-validation.ts");
const {
  extractReceiptDataWithModel,
  isRetryableGeminiError,
} = await import("../lib/services/ai-reconciliation.ts");
const { compareReceiptBeneficiary } = await import("../lib/services/receipt-validation.ts");

function buildDeUnaReceipt(overrides = {}) {
  return {
    amount: 80,
    date: "2026-07-02",
    reference: "22165634",
    description: "Pago desde DeUna",
    sender_name: "Carol Stefanía Olmedo Estrella",
    bank_name: null,
    beneficiary_name: "Alianza Cristiana y Misionera Iglesia Evangélica Ecuatoriana",
    beneficiary_account: "******3009",
    currency: "USD",
    is_valid_receipt: true,
    is_correct_beneficiary: true,
    document_kind: "payment_receipt",
    operation_type: "payment",
    receipt_confidence: "high",
    rejection_signals: [],
    bank_signals: ["DeUna", "pagaste a", "código de verificación"],
    ocr_summary: "DeUna pagaste a Alianza Cristiana y Misionera código de verificación",
    ...overrides,
  };
}

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

test("strict receipt validation rejects transfers to accounts outside active church accounts", () => {
  const result = resolveFinancialReceiptValidation({
    extractedData: {
      amount: 99,
      date: "2026-04-17",
      reference: "TRX554433",
      description: "Transferencia exitosa",
      sender_name: "Maria Gomez",
      bank_name: "Banco Pichincha",
      beneficiary_name: "Cuenta externa",
      beneficiary_account: "5326",
      currency: "USD",
      is_valid_receipt: true,
      is_correct_beneficiary: false,
      document_kind: "bank_receipt",
      operation_type: "transfer",
      receipt_confidence: "high",
      rejection_signals: [],
      bank_signals: ["transferencia", "comprobante", "banco"],
      ocr_summary: "comprobante de transferencia a cuenta 5326",
    },
    destinationAccount: {
      bank_name: "Pichincha",
      account_holder: "Iglesia Alianza Puembo",
      account_number: "2208033009",
    },
    acceptedDestinationAccounts: [
      {
        bank_name: "Pichincha",
        account_holder: "Iglesia Alianza Puembo",
        account_number: "2208033009",
      },
      {
        bank_name: "Produbanco",
        account_holder: "Iglesia Alianza Puembo",
        account_number: "4455667788",
      },
    ],
  });

  assert.equal(result.status, "invalid");
  assert.match(result.reason, /no pertenece a Iglesia Alianza Puembo/i);
});

test("strict receipt validation accepts any active church account, not only the form account", () => {
  const result = resolveFinancialReceiptValidation({
    extractedData: {
      amount: 99,
      date: "2026-04-17",
      reference: "TRX554433",
      description: "Transferencia exitosa",
      sender_name: "Maria Gomez",
      bank_name: "Produbanco",
      beneficiary_name: "Iglesia Alianza Puembo",
      beneficiary_account: "4455667788",
      currency: "USD",
      is_valid_receipt: true,
      is_correct_beneficiary: true,
      document_kind: "bank_receipt",
      operation_type: "transfer",
      receipt_confidence: "high",
      rejection_signals: [],
      bank_signals: ["transferencia", "comprobante", "banco"],
      ocr_summary: "comprobante de transferencia produbanco alianza puembo",
    },
    destinationAccount: {
      bank_name: "Pichincha",
      account_holder: "Iglesia Alianza Puembo",
      account_number: "2208033009",
    },
    acceptedDestinationAccounts: [
      {
        bank_name: "Pichincha",
        account_holder: "Iglesia Alianza Puembo",
        account_number: "2208033009",
      },
      {
        bank_name: "Produbanco",
        account_holder: "Iglesia Alianza Puembo",
        account_number: "4455667788",
      },
    ],
  });

  assert.equal(result.status, "valid");
});

test("strict receipt validation accepts masked or truncated active church accounts", () => {
  const result = resolveFinancialReceiptValidation({
    extractedData: {
      amount: 99,
      date: "2026-04-17",
      reference: "TRX554433",
      description: "Transferencia exitosa",
      sender_name: "Maria Gomez",
      bank_name: "Produbanco",
      beneficiary_name: "Iglesia",
      beneficiary_account: "XXXX7788",
      currency: "USD",
      is_valid_receipt: true,
      is_correct_beneficiary: true,
      document_kind: "bank_receipt",
      operation_type: "transfer",
      receipt_confidence: "high",
      rejection_signals: [],
      bank_signals: ["transferencia", "comprobante", "banco"],
      ocr_summary: "comprobante de transferencia produbanco alianza puembo",
    },
    destinationAccount: {
      bank_name: "Pichincha",
      account_holder: "Iglesia Alianza Puembo",
      account_number: "2208033009",
    },
    acceptedDestinationAccounts: [
      {
        bank_name: "Produbanco",
        account_holder: "Iglesia Alianza Puembo",
        account_number: "4455667788",
      },
    ],
  });

  assert.equal(result.status, "valid");
});

test("DeUna receipts match any active church account", () => {
  const result = resolveFinancialReceiptValidation({
    extractedData: buildDeUnaReceipt(),
    destinationAccount: {
      bank_name: "Produbanco",
      account_holder: "Iglesia Alianza Puembo",
      account_number: "4455667788",
    },
    acceptedDestinationAccounts: [
      {
        bank_name: "Produbanco",
        account_holder: "Iglesia Alianza Puembo",
        account_number: "4455667788",
      },
      {
        bank_name: "Pichincha",
        account_holder: "Alianza Cristiana y Misionera Iglesia Evangélica Ecuatoriana",
        account_number: "2208033009",
      },
    ],
  });

  assert.equal(result.status, "valid");
});

test("payment-app receipts without a visible destination account require manual review", () => {
  const result = classifyFinancialReceipt(
    buildDeUnaReceipt({
      bank_name: "DeUna",
      beneficiary_account: null,
      bank_signals: ["DeUna", "pagaste a", "transacción", "código de verificación"],
    }),
    {
      bank_name: "Pichincha",
      account_holder: "Alianza Cristiana y Misionera Iglesia Evangélica Ecuatoriana",
      account_number: "2208033009",
    },
  );

  assert.equal(result.status, "manual_review");
});

test("payment-app receipts without a transaction reference are invalid", () => {
  const result = classifyFinancialReceipt(
    buildDeUnaReceipt({
      reference: null,
      bank_name: "DeUna",
      bank_signals: ["DeUna", "pagaste a", "transacción", "código de verificación"],
    }),
    {
      bank_name: "Pichincha",
      account_holder: "Alianza Cristiana y Misionera Iglesia Evangélica Ecuatoriana",
      account_number: "2208033009",
    },
  );

  assert.equal(result.status, "invalid");
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

test("strict financial receipt validation rejects transient extraction failures", () => {
  assert.equal(typeof resolveFinancialReceiptValidation, "function");

  const result = resolveFinancialReceiptValidation({
    extractedData: null,
    transientFailure: true,
    destinationAccount: {
      bank_name: "Pichincha",
      account_holder: null,
      account_number: "2208033009",
    },
  });

  assert.equal(result.status, "invalid");
  assert.match(result.reason, /temporalmente/i);
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

test("receipt extraction prompt recognizes payment-app receipts", async () => {
  let receivedPrompt = "";
  const fakeModel = {
    async generateContent(input) {
      receivedPrompt = input.find((part) => typeof part.text === "string")?.text || "";
      return {
        response: {
          text() {
            return JSON.stringify({
              amount: 80,
              date: "2026-07-02",
              reference: "22165634",
              description: "Pago desde DeUna",
              sender_name: "Carol Stefanía Olmedo Estrella",
              bank_name: "Banco Pichincha",
              beneficiary_name: "Alianza Cristiana y Misionera Iglesia Evangélica Ecuatoriana",
              beneficiary_account: "******3009",
              currency: "USD",
              is_valid_receipt: true,
              is_correct_beneficiary: true,
              document_kind: "payment_receipt",
              operation_type: "payment",
              receipt_confidence: "high",
              rejection_signals: [],
              bank_signals: ["DeUna", "pagaste a", "código de verificación"],
              ocr_summary: "Pago DeUna a Alianza Cristiana y Misionera",
            });
          },
        },
      };
    },
  };

  const result = await extractReceiptDataWithModel(fakeModel, "ZmFrZQ==", "image/jpeg");

  assert.match(receivedPrompt, /payment_receipt/);
  assert.match(receivedPrompt, /DeUna/);
  assert.match(receivedPrompt, /aplicaciones de pago/i);
  assert.equal(result.data.document_kind, "payment_receipt");
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

test("receipt extraction normalizes negative displayed amounts to positive values", async () => {
  const fakeModel = {
    async generateContent() {
      return {
        response: {
          text() {
            return JSON.stringify({
              amount: -97.5,
              date: "2026-05-27",
              reference: "TRXNEG9750",
              description: "Transferencia",
              sender_name: "Usuario Banco",
              bank_name: "Banco",
              beneficiary_name: "Iglesia Alianza Puembo",
              beneficiary_account: "1234567890",
              currency: "USD",
              is_valid_receipt: true,
              is_correct_beneficiary: true,
              document_kind: "bank_receipt",
              operation_type: "transfer",
              receipt_confidence: "high",
              rejection_signals: [],
              bank_signals: ["transferencia", "comprobante", "banco"],
              ocr_summary: "comprobante con valor mostrado como negativo",
            });
          },
        },
      };
    },
  };

  const result = await extractReceiptDataWithModel(fakeModel, "ZmFrZQ==", "image/jpeg");

  assert.equal(result.data.amount, 97.5);
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
