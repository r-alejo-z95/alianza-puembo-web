import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { getPublicPaymentUploadErrorMessage } from "../lib/finance/public-payment-errors.mjs";

test("public tracking upload hides raw access-token authorization errors", () => {
  assert.equal(
    getPublicPaymentUploadErrorMessage("Acceso no autorizado o inscripción no encontrada."),
    "No pudimos validar tu enlace de seguimiento. Abre nuevamente el enlace de tu inscripción e intenta otra vez. Si el problema continúa, solicita recuperar tu enlace o contacta al equipo organizador.",
  );
});

test("public tracking upload keeps validation errors that explain the receipt problem", () => {
  assert.equal(
    getPublicPaymentUploadErrorMessage("El archivo no puede superar 5MB."),
    "El archivo no puede superar 5MB.",
  );
});

test("tracking client maps server payment errors before rendering them", () => {
  const trackingClient = readFileSync(
    new URL("../app/inscripcion/[token]/TrackingClient.jsx", import.meta.url),
    "utf8",
  );

  assert.match(trackingClient, /getPublicPaymentUploadErrorMessage/);
});
