import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  canManageSubmissionResponses,
  getEditableSubmissionFields,
  buildEditableSubmissionValues,
  buildSubmissionResponseUpdate,
} from "../lib/forms/submission-admin.mjs";

const form = {
  id: "form-1",
  user_id: "creator-1",
  form_fields: [
    { id: "name", label: "Nombre", type: "text", order_index: 1 },
    { id: "email", label: "Correo", type: "email", order_index: 2 },
    { id: "shirt", label: "Talla", type: "select", order_index: 3 },
    { id: "receipt", label: "Comprobante", type: "file", order_index: 4 },
    { id: "photo", label: "Foto", type: "image", order_index: 5 },
  ],
};

const submission = {
  id: "submission-1",
  form_id: "form-1",
  data: {
    name: "Ana",
    Nombre: "Ana",
    email: "ana@example.com",
    Correo: "ana@example.com",
    receipt: {
      _type: "file",
      name: "recibo.jpg",
      financial_receipt_path: "finance_receipts/form/recibo.jpg",
    },
    Comprobante: {
      _type: "file",
      name: "recibo.jpg",
      financial_receipt_path: "finance_receipts/form/recibo.jpg",
    },
    photo: { _type: "file", name: "foto.jpg" },
    Foto: { _type: "file", name: "foto.jpg" },
    Timestamp: "29/4/2026 10:00:00",
  },
  answers: [
    { field_id: "name", key: "name", label: "Nombre", type: "text", value: "Ana", order_index: 1 },
    { field_id: "email", key: "email", label: "Correo", type: "email", value: "ana@example.com", order_index: 2 },
    { field_id: "shirt", key: "shirt", label: "Talla", type: "select", value: "M", order_index: 3 },
    {
      field_id: "receipt",
      key: "receipt",
      label: "Comprobante",
      type: "file",
      value: {
        _type: "file",
        name: "recibo.jpg",
        financial_receipt_path: "finance_receipts/form/recibo.jpg",
      },
      order_index: 4,
    },
    {
      field_id: "photo",
      key: "photo",
      label: "Foto",
      type: "image",
      value: { _type: "file", name: "foto.jpg" },
      order_index: 5,
    },
  ],
};

test("only the form creator or a super admin can manage submission responses", () => {
  assert.equal(canManageSubmissionResponses({ id: "creator-1", is_super_admin: false }, form), true);
  assert.equal(canManageSubmissionResponses({ id: "other-admin", is_super_admin: false }, form), false);
  assert.equal(canManageSubmissionResponses({ id: "super", is_super_admin: true }, form), true);
  assert.equal(canManageSubmissionResponses(null, form), false);
});

test("editable submission fields exclude file and image fields", () => {
  const fields = getEditableSubmissionFields(form, submission);

  assert.deepEqual(fields.map((field) => field.id), ["name", "email", "shirt"]);
});

test("initial editable values are read from structured answers before legacy data", () => {
  const values = buildEditableSubmissionValues(form, submission);

  assert.deepEqual(values, {
    name: "Ana",
    email: "ana@example.com",
    shirt: "M",
  });
});

test("submission response update preserves files and timestamp while changing editable fields", () => {
  const update = buildSubmissionResponseUpdate({
    form,
    submission,
    values: {
      name: "Ana Maria",
      email: "ana.maria@example.com",
      shirt: "L",
      receipt: "malicious replacement",
    },
  });

  assert.equal(update.data.name, "Ana Maria");
  assert.equal(update.data.Nombre, "Ana Maria");
  assert.equal(update.data.email, "ana.maria@example.com");
  assert.equal(update.data.Correo, "ana.maria@example.com");
  assert.equal(update.data.shirt, "L");
  assert.equal(update.data.Talla, "L");
  assert.equal(update.data.Timestamp, "29/4/2026 10:00:00");
  assert.deepEqual(update.data.receipt, submission.data.receipt);
  assert.deepEqual(update.data.Comprobante, submission.data.Comprobante);
  assert.deepEqual(update.data.photo, submission.data.photo);

  assert.equal(update.answers.find((answer) => answer.field_id === "name").value, "Ana Maria");
  assert.equal(update.answers.find((answer) => answer.field_id === "email").value, "ana.maria@example.com");
  assert.equal(update.answers.find((answer) => answer.field_id === "shirt").value, "L");
  assert.deepEqual(
    update.answers.find((answer) => answer.field_id === "receipt").value,
    submission.answers.find((answer) => answer.field_id === "receipt").value,
  );
});

test("submission response management is wired through server actions and analytics", () => {
  const formsActions = readFileSync(new URL("../lib/actions/forms.ts", import.meta.url), "utf8");
  const rootActions = readFileSync(new URL("../lib/actions.ts", import.meta.url), "utf8");
  const formsData = readFileSync(new URL("../lib/data/forms.ts", import.meta.url), "utf8");
  const analyticsPage = readFileSync(new URL("../app/admin/formularios/analiticas/[slug]/page.js", import.meta.url), "utf8");
  const analyticsDashboard = readFileSync(new URL("../components/admin/managers/AnalyticsDashboard.jsx", import.meta.url), "utf8");

  assert.match(formsActions, /updateFormSubmissionResponse/);
  assert.match(formsActions, /archiveFormSubmissionResponse/);
  assert.match(formsActions, /getArchivedFormSubmissionResponses/);
  assert.match(formsActions, /restoreArchivedFormSubmissionResponse/);
  assert.match(formsActions, /permanentlyDeleteFormSubmissionResponse/);
  assert.match(formsActions, /canManageSubmissionResponses/);
  assert.match(formsActions, /buildSubmissionResponseUpdate/);
  assert.doesNotMatch(formsActions, /forms\(id, user_id, is_internal, is_archived, form_fields!form_id/);
  assert.match(formsActions, /\.from\("forms"\)[\s\S]*form_fields!form_id\(\*\)[\s\S]*\.eq\("id", \(submission as any\)\.form_id\)/);
  assert.match(formsData, /getCachedFormSubmissions[\s\S]*\.eq\("is_archived", false\)/);
  assert.match(analyticsPage, /verifyPermission\("perm_forms"\)/);
  assert.match(analyticsPage, /canManageResponses=/);
  assert.match(analyticsDashboard, /canManageResponses/);
  assert.match(analyticsDashboard, /updateFormSubmissionResponse/);
  assert.match(analyticsDashboard, /archiveFormSubmissionResponse/);
  assert.match(analyticsDashboard, /RecycleBin/);
  assert.match(analyticsDashboard, /Papelera/);
  assert.match(analyticsDashboard, /getArchivedFormSubmissionResponses/);
  assert.match(analyticsDashboard, /restoreArchivedFormSubmissionResponse/);
  assert.match(analyticsDashboard, /permanentlyDeleteFormSubmissionResponse/);
  assert.match(rootActions, /submissionCount[\s\S]*\.eq\("is_archived", false\)/);
  assert.match(rootActions, /newCount[\s\S]*\.eq\("is_archived", false\)/);
});
