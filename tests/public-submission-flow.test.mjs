import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

test("public form submission uses persistent result messaging instead of submit toasts", () => {
  const renderer = readFileSync(
    new URL("../components/public/forms/fluent-renderer/FluentRenderer.jsx", import.meta.url),
    "utf8",
  );

  assert.match(renderer, /submissionResult/);
  assert.match(renderer, /result\.outcome/);
  assert.doesNotMatch(renderer, /toast\.error\(e\.message \|\| "Error al enviar el formulario"/);
  assert.match(renderer, /Pasos a seguir/);
});

test("public inscription lookup portal and homepage entry are wired", () => {
  assert.equal(existsSync(new URL("../app/inscripcion/page.js", import.meta.url)), true);
  assert.equal(existsSync(new URL("../app/inscripcion/InscripcionLookupClient.jsx", import.meta.url)), true);

  const home = readFileSync(new URL("../app/page.js", import.meta.url), "utf8");
  const formRenderer = readFileSync(
    new URL("../components/public/forms/fluent-renderer/FluentRenderer.jsx", import.meta.url),
    "utf8",
  );

  assert.match(home, /InscriptionAccess/);
  assert.match(formRenderer, /Ya estoy inscrito/);
  assert.match(formRenderer, /\/inscripcion/);
});

test("public form result modal can confirm a shared payment and resubmit current values", () => {
  const renderer = readFileSync(
    new URL("../components/public/forms/fluent-renderer/FluentRenderer.jsx", import.meta.url),
    "utf8",
  );

  assert.match(renderer, /confirmSharedPayment/);
  assert.match(renderer, /getValues\(\)/);
  assert.match(renderer, /sharedPaymentConfirmation:\s*options\.sharedPaymentConfirmation \|\| null/);
});

test("tracking and recovery flows use canonical submission balance summaries", () => {
  const trackingClient = readFileSync(
    new URL("../app/inscripcion/[token]/TrackingClient.jsx", import.meta.url),
    "utf8",
  );
  const actions = readFileSync(new URL("../lib/actions.ts", import.meta.url), "utf8");

  assert.match(trackingClient, /getSubmissionBalanceSummary/);
  assert.doesNotMatch(trackingClient, /getSubmissionPaymentSummary/);
  assert.match(actions, /getSubmissionBalanceSummary/);
  assert.match(actions, /coverage_mode,\s*coverage_amount,\s*covered_by_submission_id/);
});

test("tracking status badge wraps long labels on mobile", () => {
  const trackingClient = readFileSync(
    new URL("../app/inscripcion/[token]/TrackingClient.jsx", import.meta.url),
    "utf8",
  );

  assert.match(trackingClient, /max-w-full/);
  assert.match(trackingClient, /whitespace-normal/);
  assert.match(trackingClient, /sm:whitespace-nowrap/);
  assert.match(trackingClient, /leading-tight/);
});

test("tracking payment history rows keep receipt arrow inside mobile width", () => {
  const trackingClient = readFileSync(
    new URL("../app/inscripcion/[token]/TrackingClient.jsx", import.meta.url),
    "utf8",
  );

  assert.match(trackingClient, /flex flex-col gap-4 p-5 bg-white rounded-2xl/);
  assert.match(trackingClient, /sm:flex-row sm:items-center sm:justify-between/);
  assert.match(trackingClient, /max-w-\[calc\(100%-3rem\)\]/);
  assert.match(trackingClient, /shrink-0 hover:bg-\[var\(--puembo-green\)\]\/10/);
});

test("tracking page fills the mobile viewport background", () => {
  const trackingPage = readFileSync(
    new URL("../app/inscripcion/[token]/page.js", import.meta.url),
    "utf8",
  );

  assert.match(trackingPage, /min-h-\[100dvh\]/);
  assert.match(trackingPage, /overflow-x-hidden/);
  assert.match(trackingPage, /env\(safe-area-inset-bottom\)/);
});

test("public renderer submits pricing package and participant details", () => {
  const renderer = readFileSync(
    new URL("../components/public/forms/fluent-renderer/FluentRenderer.jsx", import.meta.url),
    "utf8",
  );

  assert.match(renderer, /participant_details/);
  assert.match(renderer, /pricingPackageId/);
  assert.match(renderer, /collect_participant_details/);
  assert.match(renderer, /participant_template/);
});

test("public file fields upload to the correct Supabase bucket without Drive payloads", () => {
  const renderer = readFileSync(
    new URL("../components/public/forms/fluent-renderer/FluentRenderer.jsx", import.meta.url),
    "utf8",
  );

  assert.match(renderer, /uploadFormAttachment/);
  assert.match(renderer, /const\s+uploadAction\s*=\s*isFinancialField\s*\?\s*uploadReceipt\s*:\s*uploadFormAttachment/);
  assert.match(renderer, /storage_path/);
  assert.match(renderer, /financial_receipt_path/);
  assert.doesNotMatch(renderer, /processedDataForGoogle/);
  assert.doesNotMatch(renderer, /FileReader/);
});

test("public submit action no longer exposes Sheets or Drive integration actions", () => {
  const actions = readFileSync(new URL("../lib/actions.ts", import.meta.url), "utf8");

  assert.doesNotMatch(actions, /processedDataForGoogle/);
  assert.doesNotMatch(actions, /export async function createFormAndSheet/);
  assert.doesNotMatch(actions, /export async function regenerateFormAndSheet/);
  assert.doesNotMatch(actions, /export async function initializeGoogleIntegration/);
  assert.doesNotMatch(actions, /export async function syncFormToSheets/);
  assert.doesNotMatch(actions, /sheets-drive-integration/);
});
