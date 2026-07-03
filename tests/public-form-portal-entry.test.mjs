import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("homepage introduces discovery and private follow-up", () => {
  const source = readFileSync(
    new URL(
      "../components/public/homepage/InscriptionAccess.jsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(source, /Inscripciones abiertas/);
  assert.match(source, /Encuentra tu próximo paso/);
  assert.match(source, /Explora actividades, talleres y encuentros abiertos/);
  assert.match(source, /consultar tu registro y seguimiento de pagos/);
  assert.match(source, /Explorar inscripciones/);
  assert.match(source, /Inscripciones · seguimiento · abonos/);
  assert.doesNotMatch(source, /Pagos de eventos/);
  assert.doesNotMatch(source, /Subir otro abono/);
});

test("formularios entry redirects to the unified portal", () => {
  const source = readFileSync(
    new URL("../app/formularios/page.js", import.meta.url),
    "utf8",
  );

  assert.match(source, /redirect\("\/inscripcion"\)/);
  assert.doesNotMatch(source, /"use client"/);
});
