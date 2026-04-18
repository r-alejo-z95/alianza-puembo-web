import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const { auditReceiptDirectory } = await import("../lib/finance/receipt-audit.mjs");

test("auditReceiptDirectory processes supported files and ignores unsupported ones", async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "receipt-audit-"));
  await fs.writeFile(path.join(tempDir, "valido.jpeg"), "fake-image");
  await fs.writeFile(path.join(tempDir, "ignorar.txt"), "ignore");

  const results = await auditReceiptDirectory({
    dirPath: tempDir,
    destinationAccount: {
      bank_name: "Pichincha",
      account_number: "2208033009",
      account_holder: null,
    },
    extractReceipt: async () => ({
      data: {
        amount: 25,
        date: "2026-04-17",
        reference: "ABC123",
        description: "Transferencia exitosa",
        sender_name: "Juan",
        bank_name: "Pichincha",
        beneficiary_name: "Iglesia",
        beneficiary_account: "2208033009",
        currency: "USD",
        is_valid_receipt: true,
        is_correct_beneficiary: true,
        document_kind: "bank_receipt",
        operation_type: "transfer",
        receipt_confidence: "high",
        rejection_signals: [],
        bank_signals: ["transferencia", "comprobante", "banco"],
        ocr_summary: "comprobante de transferencia exitosa banco pichincha referencia abc123",
      },
      transientFailure: false,
    }),
  });

  assert.equal(results.length, 1);
  assert.equal(results[0].fileName, "valido.jpeg");
  assert.equal(results[0].status, "valid");
});

test("auditReceiptDirectory downgrades transient extraction failures to manual review", async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "receipt-audit-"));
  await fs.writeFile(path.join(tempDir, "fallo.jpeg"), "fake-image");

  const results = await auditReceiptDirectory({
    dirPath: tempDir,
    destinationAccount: {
      bank_name: "Pichincha",
      account_number: "2208033009",
      account_holder: null,
    },
    extractReceipt: async () => ({
      data: null,
      transientFailure: true,
    }),
  });

  assert.equal(results.length, 1);
  assert.equal(results[0].status, "manual_review");
  assert.match(results[0].reason, /falló temporalmente/i);
});
