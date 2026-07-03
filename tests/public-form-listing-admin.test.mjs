import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("form setup exposes an opt-in public portal switch", () => {
  const source = readFileSync(
    new URL(
      "../components/admin/forms/builder/FormSetupWizard.jsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(
    source,
    /is_publicly_listed: z\.boolean\(\)\.default\(false\)/,
  );
  assert.match(
    source,
    /is_publicly_listed: !!initialValues\.is_publicly_listed/,
  );
  assert.match(source, /Mostrar en el portal público/);
  assert.match(
    source,
    /Permite que las personas encuentren este formulario y consulten su inscripción\./,
  );
  assert.match(source, /disabled=\{form\.watch\("is_internal"\)\}/);
});

test("form setup persists public listing only for public forms", () => {
  const source = readFileSync(
    new URL("../lib/actions/forms.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /is_publicly_listed\?: boolean/);
  assert.match(
    source,
    /is_publicly_listed: values\.is_internal \? false : !!values\.is_publicly_listed/,
  );
});
