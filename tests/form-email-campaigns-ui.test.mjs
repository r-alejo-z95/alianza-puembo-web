import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("analytics page fetches form email campaigns and passes email management access", () => {
  const page = readFileSync(
    new URL(
      "../app/admin/formularios/analiticas/[slug]/page.js",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(page, /getFormEmailCampaigns/);
  assert.match(page, /canManageEmails/);
  assert.match(page, /emailCampaigns/);
});

test("analytics dashboard exposes Correos tab and campaign panel", () => {
  const dashboard = readFileSync(
    new URL(
      "../components/admin/managers/AnalyticsDashboard.jsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(dashboard, /FormEmailCampaignsPanel/);
  assert.match(dashboard, /value="emails"/);
  assert.match(dashboard, /Correos/);
});

test("form email campaigns panel includes editor, recipients, preview, scheduling, and pointer cursors", () => {
  const panel = readFileSync(
    new URL(
      "../components/admin/forms/email/FormEmailCampaignsPanel.jsx",
      import.meta.url,
    ),
    "utf8",
  );

  for (const text of [
    "Campa(?:n|ñ)as",
    "Programadas",
    "Enviados",
    "Fallidos",
    "Asunto",
    "Destinatarios",
    "Previsualizar",
    "Enviar ahora",
    "Programar",
    "Adjuntos",
  ]) {
    assert.match(panel, new RegExp(text));
  }

  assert.match(panel, /RichTextEditor/);
  assert.match(panel, /cursor-pointer/);
  assert.match(panel, /saveFormEmailCampaign/);
  assert.match(panel, /scheduleFormEmailCampaign/);
  assert.match(panel, /sendFormEmailCampaignNow/);
  assert.match(panel, /sendFormEmailCampaignTest/);
});

test("global button styles keep pointer cursors on clickable buttons", () => {
  const css = readFileSync(
    new URL("../app/globals.css", import.meta.url),
    "utf8",
  );

  assert.match(css, /button:not\(:disabled\)/);
  assert.match(css, /cursor:\s*pointer/);
  assert.match(css, /button:disabled/);
  assert.match(css, /cursor:\s*not-allowed/);
});
