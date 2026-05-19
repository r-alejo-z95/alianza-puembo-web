import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const trackingClient = readFileSync(
  new URL("../app/inscripcion/[token]/TrackingClient.jsx", import.meta.url),
  "utf8",
);

const financeActions = readFileSync(
  new URL("../lib/actions/finance.ts", import.meta.url),
  "utf8",
);

test("tracking receipt viewer uses a modal instead of opening a new tab", () => {
  assert.match(trackingClient, /getTrackingReceiptSignedUrl/);
  assert.match(trackingClient, /<Dialog/);
  assert.match(trackingClient, /Visor de comprobante/);
  assert.match(trackingClient, /viewingReceipt/);
  assert.match(trackingClient, /Preparando comprobante/);
  assert.match(trackingClient, /<iframe/);
  assert.match(trackingClient, /<img/);
  assert.doesNotMatch(trackingClient, /window\.open/);
});

test("tracking receipt viewer matches the finance receipt modal layout", () => {
  assert.match(trackingClient, /max-w-5xl/);
  assert.match(trackingClient, /h-\[82vh\]/);
  assert.match(trackingClient, /bg-black\/80/);
  assert.match(trackingClient, /bg-neutral-950/);
  assert.match(trackingClient, /receiptZoom/);
  assert.match(trackingClient, /receiptRotation/);
  assert.match(trackingClient, /RotateCw/);
  assert.match(trackingClient, /overlayClassName="z-\[120\] bg-black\/80 backdrop-blur-sm"/);
  assert.match(trackingClient, /z-\[130\]/);
  assert.doesNotMatch(trackingClient, /w-\[96vw\]/);
});

test("public tracking receipt signing verifies token and receipt ownership", () => {
  const start = financeActions.indexOf("export async function getTrackingReceiptSignedUrl");
  const end = financeActions.indexOf("/**\n * Agrega un nuevo abono", start);
  const action = financeActions.slice(start, end);

  assert.notEqual(start, -1);
  assert.match(action, /createAdminClient\(\)/);
  assert.match(action, /\.eq\("id", submissionId\)/);
  assert.match(action, /\.eq\("access_token", accessToken\)/);
  assert.match(action, /form_submission_payments\(receipt_path\)/);
  assert.match(action, /coverage_backup_path/);
  assert.match(action, /authorizedPaths/);
  assert.match(action, /createSignedUrl/);
  assert.doesNotMatch(action, /verifyPermission/);
});
