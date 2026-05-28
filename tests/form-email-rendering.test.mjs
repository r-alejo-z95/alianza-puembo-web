import test from "node:test";
import assert from "node:assert/strict";

import {
  buildFormEmailVariables,
  renderFormEmailTemplate,
  wrapFormEmailHtml,
} from "../lib/forms/email-rendering.mjs";

test("buildFormEmailVariables extracts standard form and submission variables", () => {
  const variables = buildFormEmailVariables({
    form: { title: "Retiro Mujeres", is_financial: false },
    submission: {
      created_at: "2026-05-28T15:00:00.000Z",
      notification_email: "ana@example.com",
      access_token: "abc123",
      data: { Nombre: "Ana Molina" },
      answers: [
        { label: "Nombre completo", value: "Ana Molina", type: "text" },
      ],
    },
    siteUrl: "https://alianzapuembo.org",
  });

  assert.equal(variables.nombre, "Ana Molina");
  assert.equal(variables.formulario, "Retiro Mujeres");
  assert.equal(variables.correo, "ana@example.com");
  assert.equal(
    variables.link_seguimiento,
    "https://alianzapuembo.org/inscripcion/abc123",
  );
  assert.equal(variables.estado_pago, "");
});

test("renderFormEmailTemplate replaces known variables and reports unknown variables", () => {
  const rendered = renderFormEmailTemplate({
    subject: "Hola {{nombre}}",
    bodyHtml: "<p>{{nombre}} inscrita en {{formulario}} {{variable_rara}}</p>",
    variables: {
      nombre: "Ana",
      formulario: "Retiro",
    },
  });

  assert.equal(rendered.subject, "Hola Ana");
  assert.equal(rendered.bodyHtml, "<p>Ana inscrita en Retiro </p>");
  assert.deepEqual(rendered.missingVariables, ["variable_rara"]);
});

test("wrapFormEmailHtml keeps branding and injects body html", () => {
  const html = wrapFormEmailHtml({
    title: "Registro confirmado",
    bodyHtml: "<p>Contenido</p>",
    ctaLabel: "Abrir seguimiento",
    ctaUrl: "https://alianzapuembo.org/inscripcion/abc123",
  });

  assert.match(html, /logo-puembo-white\.png/);
  assert.match(html, /Registro confirmado/);
  assert.match(html, /Contenido/);
  assert.match(html, /Abrir seguimiento/);
});
