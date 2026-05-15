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
