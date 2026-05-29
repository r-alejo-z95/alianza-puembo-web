import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("forms admin page no longer imports or renders the landing notice dialog", () => {
  const pageSource = readFileSync(new URL("../app/admin/formularios/page.js", import.meta.url), "utf8");

  assert.doesNotMatch(pageSource, /FormLandingNoticeDialog/);
});

test("form builder persists payment reminder interval configuration", () => {
  const builderPage = readFileSync(
    new URL("../app/admin/formularios/builder/page.js", import.meta.url),
    "utf8",
  );
  const formBuilder = readFileSync(
    new URL("../components/admin/forms/builder/FormBuilder.jsx", import.meta.url),
    "utf8",
  );
  const setupWizard = readFileSync(
    new URL("../components/admin/forms/builder/FormSetupWizard.jsx", import.meta.url),
    "utf8",
  );
  const formActions = readFileSync(new URL("../lib/actions/forms.ts", import.meta.url), "utf8");

  assert.match(builderPage, /payment_reminder_interval_days/);
  assert.match(formBuilder, /payment_reminder_interval_days/);
  assert.match(setupWizard, /payment_reminder_interval_days/);
  assert.match(formActions, /payment_reminder_interval_days/);
  assert.match(setupWizard, /Cada 7 dias/);
  assert.match(formBuilder, /Recordatorios de pago/);
});

test("forms manager mobile header keeps payment and trash actions visible", () => {
  const manager = readFileSync(
    new URL("../components/admin/managers/FormManager.jsx", import.meta.url),
    "utf8",
  );

  assert.match(manager, /grid w-full grid-cols-2 gap-3 md:flex md:w-auto/);
  assert.match(manager, /<span className="[^"]*md:hidden[^"]*">\s*Pagos\s*<\/span>/);
  assert.match(manager, /<span className="[^"]*hidden md:inline[^"]*">\s*Inscripciones con pagos\s*<\/span>/);
  assert.match(manager, /w-full md:w-auto/);
});
