import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("public file uploads only offer images and PDFs", () => {
  const renderer = readFileSync(
    new URL("../components/public/forms/fluent-renderer/FluentRenderer.jsx", import.meta.url),
    "utf8",
  );
  const receiptFilePolicy = readFileSync(
    new URL("../lib/finance/receipt-file.ts", import.meta.url),
    "utf8",
  );

  assert.match(renderer, /RECEIPT_FILE_ACCEPT/);
  assert.match(receiptFilePolicy, /image\/\*,application\/pdf/);
});

test("financial receipt upload rejects unsupported mime types on the server", () => {
  const actions = readFileSync(new URL("../lib/actions.ts", import.meta.url), "utf8");

  assert.match(actions, /isSupportedReceiptMimeType/);
  assert.match(actions, /Tipo de archivo no permitido/);
});

test("financial submissions use strict receipt validation policy", () => {
  const actions = readFileSync(new URL("../lib/actions.ts", import.meta.url), "utf8");

  assert.match(actions, /resolveFinancialReceiptValidation/);
  assert.match(actions, /aiTransientFailure\s*\?\s*validation\.reason\s*:\s*INVALID_RECEIPT_MESSAGE/);
  assert.doesNotMatch(actions, /aiTransientFailure\s*\?\s*\{\s*status:\s*"manual_review"/s);
});
