import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

test("inscription page server-loads both public portal collections", () => {
  const source = readFileSync(
    new URL("../app/inscripcion/page.js", import.meta.url),
    "utf8",
  );

  assert.match(source, /Suspense/);
  assert.match(source, /getPubliclyListedForms/);
  assert.match(source, /preparePublicFormListings/);
  assert.match(source, /catalogForms=\{catalogForms\}/);
  assert.match(source, /lookupForms=\{lookupForms\}/);
});

test("portal exposes catalog and exact lookup experiences", () => {
  const componentUrl = new URL(
    "../components/public/inscriptions/InscriptionPortal.jsx",
    import.meta.url,
  );

  assert.equal(existsSync(componentUrl), true);
  const source = readFileSync(componentUrl, "utf8");
  assert.match(source, /Quiero inscribirme/);
  assert.match(source, /Ya me inscribí/);
  assert.match(source, /Buscar inscripciones/);
  assert.match(source, /filterPublicFormListings/);
  assert.match(source, /Buscar el formulario/);
  assert.match(source, /requestPublicFormSubmissionLookup/);
  assert.match(source, /TurnstileCaptcha/);
  assert.match(source, /key=\{captchaKey\}/);
  assert.match(source, /Tengo mi token o enlace/);
  assert.match(source, /Inscripción abierta/);
  assert.match(source, /Con pago/);
  assert.match(source, /No hay inscripciones abiertas en este momento\./);
  assert.match(source, /No encontramos inscripciones con ese nombre\./);
  assert.doesNotMatch(source, /dangerouslySetInnerHTML/);
});

test("the general email-only lookup is retired with its old client", () => {
  assert.equal(
    existsSync(
      new URL(
        "../app/inscripcion/InscripcionLookupClient.jsx",
        import.meta.url,
      ),
    ),
    false,
  );

  const actions = readFileSync(
    new URL("../lib/actions.ts", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(
    actions,
    /export async function requestSubmissionTrackingLinks/,
  );
});
