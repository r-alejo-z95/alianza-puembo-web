import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("public renderer asks every public form for notification email", () => {
  const renderer = readFileSync(
    new URL(
      "../components/public/forms/fluent-renderer/FluentRenderer.jsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(
    renderer,
    /Paso Virtual de Notificaci[oó]n para formularios p[uú]blicos/,
  );
  assert.match(renderer, /if \(!form\.is_internal\) \{/);
  assert.doesNotMatch(
    renderer,
    /if \(!form\.is_internal && form\.is_financial\) \{\s*groups\.push/,
  );
});

test("public finalize flow is wired to the notification-step resolver", () => {
  const renderer = readFileSync(
    new URL(
      "../components/public/forms/fluent-renderer/FluentRenderer.jsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(renderer, /resolveSubmitDestination/);
  assert.match(renderer, /id: NOTIFICATION_STEP_ID/);
  assert.match(renderer, /submitDestination\.type === "step"/);
  assert.match(renderer, /setCurrentStep\(submitDestination\.stepIndex\)/);
});

test("submitFormAction sends registration confirmation for all public submissions", () => {
  const actions = readFileSync(
    new URL("../lib/actions.ts", import.meta.url),
    "utf8",
  );

  assert.match(actions, /sendRegistrationConfirmationEmail/);
  assert.match(actions, /\.select\("[^"]*is_internal[^"]*"/);
  assert.match(actions, /if \(!form\.is_internal && !String\(notificationEmail \|\| ""\)\.trim\(\)\)/);
  assert.match(actions, /if \(notificationEmail && !form\.is_internal\)/);
  assert.doesNotMatch(
    actions,
    /if \(notificationEmail && form\.is_financial\)/,
  );
});

test("registration confirmation sender supports optional financial summary", () => {
  const service = readFileSync(
    new URL("../lib/services/form-emails.ts", import.meta.url),
    "utf8",
  );

  assert.match(service, /export async function sendRegistrationConfirmationEmail/);
  assert.match(service, /financialSummary/);
  assert.match(service, /Resumen de pago/);
  assert.match(service, /Registro confirmado/);
});

test("registration confirmation does not add tracking link for non-financial forms", () => {
  const service = readFileSync(
    new URL("../lib/services/form-emails.ts", import.meta.url),
    "utf8",
  );

  assert.match(service, /const includeTrackingLink = Boolean\(financialSummary && trackingUrl\)/);
  assert.doesNotMatch(
    service,
    /ctaLabel:\s*trackingUrl\s*\?\s*"Abrir seguimiento"/,
  );
  assert.doesNotMatch(service, /Guarda este enlace/);
});

test("registration and campaign emails use expected amount snapshots", () => {
  const service = readFileSync(
    new URL("../lib/services/form-emails.ts", import.meta.url),
    "utf8",
  );

  assert.match(service, /expected_amount/);
  assert.match(service, /getSubmissionBalanceSummary/);
  assert.match(service, /totalAmount:\s*Number\(submission\?\.expected_amount/);
});
