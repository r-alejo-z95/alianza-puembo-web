import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

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

test("financial and general form uploads use separate storage buckets", () => {
  const actions = readFileSync(new URL("../lib/actions.ts", import.meta.url), "utf8");
  const storage = readFileSync(new URL("../lib/finance/storage.ts", import.meta.url), "utf8");
  const migrationUrl = new URL(
    "../supabase/migrations/20260626000000_add_form_uploads_bucket.sql",
    import.meta.url,
  );

  assert.match(storage, /FORM_UPLOADS_BUCKET\s*=\s*"form_uploads"/);
  assert.match(storage, /ensureFormUploadsBucket/);
  assert.equal(existsSync(migrationUrl), true);

  const attachmentStart = actions.indexOf("export async function uploadFormAttachment");
  const receiptStart = actions.indexOf("export async function uploadReceipt");
  assert.notEqual(attachmentStart, -1);
  assert.notEqual(receiptStart, -1);

  const attachmentBlock = actions.slice(attachmentStart, receiptStart);
  const receiptBlock = actions.slice(receiptStart);

  assert.match(attachmentBlock, /ensureFormUploadsBucket/);
  assert.match(attachmentBlock, /isFinancialReceiptField/);
  assert.match(attachmentBlock, /El comprobante financiero debe subirse al bucket financiero/);
  assert.match(attachmentBlock, /\.from\("form_uploads"\)/);
  assert.doesNotMatch(attachmentBlock, /finance_receipts/);

  assert.match(receiptBlock, /ensureFinanceReceiptsBucket/);
  assert.match(receiptBlock, /\.from\("finance_receipts"\)/);
  assert.doesNotMatch(receiptBlock, /form_uploads/);
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

test("receipt reprocessing validates against every active church account", () => {
  const financeActions = readFileSync(new URL("../lib/actions/finance.ts", import.meta.url), "utf8");
  const start = financeActions.indexOf("export async function reprocessSubmissionWithReceipt");
  const reprocessBlock = financeActions.slice(start);

  assert.notEqual(start, -1);
  assert.match(reprocessBlock, /\.from\("bank_accounts"\)[\s\S]*?\.eq\("is_active", true\)/);
  assert.match(reprocessBlock, /resolveFinancialReceiptValidation\(\{[\s\S]*?acceptedDestinationAccounts/);
  assert.doesNotMatch(reprocessBlock, /classifyFinancialReceipt\(/);
});
