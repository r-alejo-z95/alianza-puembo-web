import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const analyticsDashboard = readFileSync(
  new URL("../components/admin/managers/AnalyticsDashboard.jsx", import.meta.url),
  "utf8",
);

const reconciliationWorkbench = readFileSync(
  new URL("../components/admin/finance/ReconciliationWorkbench.jsx", import.meta.url),
  "utf8",
);

test("payment group migration adds shared group tables and nullable links", () => {
  const migration = readFileSync(
    new URL("../supabase/migrations/20260528000000_add_payment_groups.sql", import.meta.url),
    "utf8",
  );

  assert.match(migration, /create table if not exists public\.payment_groups/);
  assert.match(migration, /expected_amount numeric\(12,2\)/);
  assert.match(migration, /created_by_submission_id uuid references public\.form_submissions\(id\) on delete set null/);
  assert.match(migration, /add column if not exists payment_group_id uuid references public\.payment_groups\(id\) on delete set null/);
  assert.match(migration, /alter table public\.payment_groups enable row level security/);
});

test("public shared payment confirmation creates a group and links shared submissions", () => {
  const actions = readFileSync(new URL("../lib/actions.ts", import.meta.url), "utf8");

  assert.match(actions, /ensureSharedPaymentGroup/);
  assert.match(actions, /payment_group_id:\s*sharedPaymentCoverage\.paymentGroupId/);
  assert.match(actions, /covered_by_payment_id/);
  assert.match(actions, /payment_group_id:\s*sharedPaymentCoverage\.paymentGroupId/);
});

test("tracking upload attaches new abonos to the existing payment group", () => {
  const financeActions = readFileSync(new URL("../lib/actions/finance.ts", import.meta.url), "utf8");

  assert.match(financeActions, /payment_group_id/);
  assert.match(financeActions, /paymentGroupId/);
  assert.match(financeActions, /amount_claimed:\s*Math\.abs\(Number\(aiData\?\.amount/);
});

test("admin finance action can update the expected total for a payment group", () => {
  const financeActions = readFileSync(new URL("../lib/actions/finance.ts", import.meta.url), "utf8");

  assert.match(financeActions, /updatePaymentGroupExpectedAmount/);
  assert.match(financeActions, /\.from\("payment_groups"\)/);
  assert.match(financeActions, /expected_amount:\s*expectedAmount/);
  assert.match(financeActions, /verifyPermission\("perm_finanzas"\)/);
});

test("submission queries disambiguate payment group relationship", () => {
  const formsData = readFileSync(new URL("../lib/data/forms.ts", import.meta.url), "utf8");

  assert.match(formsData, /payment_groups!form_submissions_payment_group_id_fkey\(\*\)/);
  assert.doesNotMatch(formsData, /payment_groups\(\*\)/);
});

test("analytics does not render or edit shared payment group controls", () => {
  assert.doesNotMatch(analyticsDashboard, /updatePaymentGroupExpectedAmount/);
  assert.doesNotMatch(analyticsDashboard, /handleUpdatePaymentGroupExpectedAmount/);
  assert.doesNotMatch(analyticsDashboard, /paymentGroupId/);
  assert.doesNotMatch(analyticsDashboard, /payment_groups/);
  assert.doesNotMatch(analyticsDashboard, /Grupo de pago compartido/);
});

test("finance reconciliation owns the shared payment group total editor", () => {
  assert.match(reconciliationWorkbench, /updatePaymentGroupExpectedAmount/);
  assert.match(reconciliationWorkbench, /handleUpdatePaymentGroupExpectedAmount/);
  assert.match(reconciliationWorkbench, /Total esperado del grupo/);
  assert.match(reconciliationWorkbench, /paymentGroupDrafts/);
});
