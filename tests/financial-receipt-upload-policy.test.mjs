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
  assert.match(actions, /UNRECOGNIZED_DESTINATION_ACCOUNT_MESSAGE/);
  assert.match(actions, /INVALID_RECEIPT_MESSAGE/);
  assert.doesNotMatch(actions, /aiTransientFailure\s*\?\s*\{\s*status:\s*"manual_review"/s);
});

test("tracking payment uploads validate token ownership with the admin client", () => {
  const financeActions = readFileSync(new URL("../lib/actions/finance.ts", import.meta.url), "utf8");
  const start = financeActions.indexOf("export async function addMultipartPayment");
  const end = financeActions.indexOf("/**\n * Super-admin only", start);
  const addMultipartPayment = financeActions.slice(start, end);

  assert.match(
    addMultipartPayment,
    /const\s+\{\s*data:\s*submission[\s\S]*?=\s*await\s+supabaseAdmin\s*\n\s*\.from\("form_submissions"\)/,
  );
});

test("public financial uploads validate receipts against all active church bank accounts", () => {
  const actions = readFileSync(new URL("../lib/actions.ts", import.meta.url), "utf8");
  const financeActions = readFileSync(new URL("../lib/actions/finance.ts", import.meta.url), "utf8");

  assert.match(actions, /\.from\("bank_accounts"\)[\s\S]*?\.eq\("is_active", true\)/);
  assert.match(actions, /acceptedDestinationAccounts/);
  assert.match(financeActions, /\.from\("bank_accounts"\)[\s\S]*?\.eq\("is_active", true\)/);
  assert.match(financeActions, /acceptedDestinationAccounts/);
});
