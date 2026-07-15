import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  canManageSubmissionResponses,
  canViewFormAnalytics,
  getEditableSubmissionFields,
  buildEditableSubmissionValues,
  buildSubmissionResponseUpdate,
  buildSubmissionFinancialUpdate,
} from "../lib/forms/submission-admin.mjs";

const form = {
  id: "form-1",
  user_id: "creator-1",
  form_response_admins: [{ profile_id: "delegated-admin" }],
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

test("super admin, creator, and delegated admins can manage submission responses", () => {
  assert.equal(canManageSubmissionResponses({ id: "creator-1", is_super_admin: false }, form), true);
  assert.equal(canManageSubmissionResponses({ id: "delegated-admin", is_super_admin: false }, form), true);
  assert.equal(canManageSubmissionResponses({ id: "other-admin", is_super_admin: false }, form), false);
  assert.equal(canManageSubmissionResponses({ id: "global-forms", is_super_admin: false, permissions: { perm_forms: true } }, form), false);
  assert.equal(canManageSubmissionResponses({ id: "super", is_super_admin: true }, form), true);
  assert.equal(canManageSubmissionResponses(null, form), false);
});

test("analytics can be viewed by global forms admins and delegated admins", () => {
  assert.equal(canViewFormAnalytics({ id: "creator-1", is_super_admin: false, permissions: { perm_forms: false } }, form), true);
  assert.equal(canViewFormAnalytics({ id: "delegated-admin", is_super_admin: false, permissions: { perm_forms: false } }, form), true);
  assert.equal(canViewFormAnalytics({ id: "global-forms", is_super_admin: false, permissions: { perm_forms: true } }, form), true);
  assert.equal(canViewFormAnalytics({ id: "other-admin", is_super_admin: false, permissions: { perm_forms: false } }, form), false);
  assert.equal(canViewFormAnalytics({ id: "super", is_super_admin: true, permissions: { perm_forms: false } }, form), true);
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

test("editing a pricing package recalculates the submission amount and snapshot", () => {
  const packageForm = {
    pricing_mode: "packages",
    pricing_field_id: "package",
    collect_participant_details: true,
    participant_template: [{ id: "name", label: "Nombre", required: true }],
    pricing_packages: [
      { id: "basic", label: "Paquete básico", amount: 80, participant_count: 1, enabled: true },
      { id: "family", label: "Paquete familiar", amount: 140, participant_count: 2, enabled: true },
    ],
    form_fields: [{ id: "package", label: "Paquete", type: "select" }],
  };

  const result = buildSubmissionFinancialUpdate({
    form: packageForm,
    submission: {
      expected_amount: 80,
      pricing_snapshot: {
        mode: "packages",
        package_id: "basic",
        package_label: "Paquete básico",
        amount: 80,
        participant_count: 1,
      },
      participant_details: [
        { index: 1, answers: { Nombre: "Isabela" } },
        { index: 2, answers: { Nombre: "Lucas" } },
      ],
    },
    values: { package: "family" },
  });

  assert.equal(result.expected_amount, 140);
  assert.deepEqual(result.pricing_snapshot, {
    mode: "packages",
    package_id: "family",
    package_label: "Paquete familiar",
    amount: 140,
    participant_count: 2,
  });
  assert.deepEqual(result.participant_details, [
    { index: 1, answers: { Nombre: "Isabela" } },
    { index: 2, answers: { Nombre: "Lucas" } },
  ]);
});

test("editing a pricing package rejects unavailable packages", () => {
  assert.throws(
    () =>
      buildSubmissionFinancialUpdate({
        form: {
          pricing_mode: "packages",
          pricing_field_id: "package",
          pricing_packages: [
            { id: "basic", label: "Paquete básico", amount: 80, enabled: false },
          ],
          form_fields: [{ id: "package", label: "Paquete", type: "select" }],
        },
        submission: { expected_amount: 80, participant_details: [] },
        values: { package: "basic" },
      }),
    /La opción de inscripción ya no está disponible/,
  );
});

test("editing a package rejects when saved participant details are insufficient", () => {
  assert.throws(
    () =>
      buildSubmissionFinancialUpdate({
        form: {
          pricing_mode: "packages",
          pricing_field_id: "package",
          pricing_packages: [
            { id: "family", label: "Paquete familiar", amount: 140, participant_count: 2, enabled: true },
          ],
          collect_participant_details: true,
          participant_template: [{ id: "name", label: "Nombre", required: true }],
          form_fields: [{ id: "package", label: "Paquete", type: "select" }],
        },
        submission: {
          participant_details: [{ index: 1, answers: { Nombre: "Isabela" } }],
        },
        values: { package: "family" },
      }),
    /Se esperaban 2 participantes y se recibieron 1/,
  );
});

test("open choice answers restore their selection and written response for editing", () => {
  const choiceForm = {
    id: "form-choice",
    form_fields: [
      {
        id: "activity",
        label: "Actividad",
        type: "radio",
        order_index: 1,
        options: [
          { label: "Correr", value: "run" },
          { label: "Otra", value: "other", allows_other: true },
        ],
      },
      {
        id: "days",
        label: "Días",
        type: "checkbox",
        order_index: 2,
        options: [
          { label: "Viernes", value: "friday" },
          { label: "Otro día", value: "other", allows_other: true },
        ],
      },
    ],
  };
  const choiceSubmission = {
    data: {},
    answers: [
      {
        field_id: "activity",
        label: "Actividad",
        value: "Otra: Natación",
        choice_options: ["Otra"],
        other_text: "Natación",
      },
      {
        field_id: "days",
        label: "Días",
        value: ["Viernes", "Otro día: Domingo"],
        choice_options: ["Viernes", "Otro día"],
        other_text: "Domingo",
      },
    ],
  };

  assert.deepEqual(buildEditableSubmissionValues(choiceForm, choiceSubmission), {
    activity: "Otra",
    activity__other: "Natación",
    days: ["Viernes", "Otro día"],
    days__other: "Domingo",
  });
});

test("submission response update serializes edited open choices and rejects empty text", () => {
  const choiceForm = {
    id: "form-choice",
    form_fields: [
      {
        id: "activity",
        label: "Actividad",
        type: "radio",
        order_index: 1,
        options: [
          { label: "Correr", value: "run" },
          { label: "Otra", value: "other", allows_other: true },
        ],
      },
    ],
  };
  const choiceSubmission = {
    data: { activity: "Correr", Actividad: "Correr" },
    answers: [
      {
        field_id: "activity",
        key: "activity",
        label: "Actividad",
        type: "radio",
        value: "Correr",
      },
    ],
  };

  const update = buildSubmissionResponseUpdate({
    form: choiceForm,
    submission: choiceSubmission,
    values: {
      activity: "Otra",
      activity__other: "Natación",
    },
  });

  assert.equal(update.data.activity, "Otra: Natación");
  assert.equal(update.data.Actividad, "Otra: Natación");
  assert.deepEqual(update.answers[0].choice_options, ["Otra"]);
  assert.equal(update.answers[0].other_text, "Natación");

  assert.throws(
    () =>
      buildSubmissionResponseUpdate({
        form: choiceForm,
        submission: choiceSubmission,
        values: {
          activity: "Otra",
          activity__other: " ",
        },
      }),
    /Especifica la otra respuesta/,
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
  assert.match(formsActions, /createFormSubmissionAdminComment/);
  assert.match(formsActions, /updateFormSubmissionAdminComment/);
  assert.match(formsActions, /deleteFormSubmissionAdminComment/);
  assert.match(formsActions, /canManageSubmissionResponses/);
  assert.match(formsActions, /buildSubmissionResponseUpdate/);
  assert.match(formsActions, /buildSubmissionFinancialUpdate/);
  assert.match(formsActions, /pricing_snapshot: financialUpdate\.pricing_snapshot/);
  assert.match(formsActions, /expected_amount: financialUpdate\.expected_amount/);
  assert.match(formsActions, /participant_details: financialUpdate\.participant_details/);
  assert.match(formsActions, /recalculatePaymentGroupExpectedAmount/);
  assert.match(formsActions, /\.from\("form_response_admins"\)/);
  assert.doesNotMatch(formsActions, /form_response_admins\(profile_id\)/);
  assert.doesNotMatch(formsActions, /if \(!user\.is_super_admin && !user\.permissions\?\.perm_forms\)/);
  assert.doesNotMatch(formsActions, /forms\(id, user_id, is_internal, is_archived, form_fields!form_id/);
  assert.match(formsActions, /\.from\("forms"\)[\s\S]*form_fields!form_id\(\*\)[\s\S]*\.eq\("id", \(submission as any\)\.form_id\)/);
  assert.match(formsData, /form_submission_admin_comments/);
  assert.match(formsData, /getCachedFormSubmissions[\s\S]*\.eq\("is_archived", false\)/);
  assert.match(analyticsPage, /getSessionUser/);
  assert.match(analyticsPage, /canViewFormAnalytics/);
  assert.doesNotMatch(analyticsPage, /verifyPermission\("perm_forms"\)/);
  assert.match(analyticsPage, /canManageResponses=/);
  assert.match(analyticsDashboard, /canManageResponses/);
  assert.match(analyticsDashboard, /updateFormSubmissionResponse/);
  assert.match(analyticsDashboard, /archiveFormSubmissionResponse/);
  assert.match(analyticsDashboard, /RecycleBin/);
  assert.match(analyticsDashboard, /Papelera/);
  assert.match(analyticsDashboard, /getArchivedFormSubmissionResponses/);
  assert.match(analyticsDashboard, /restoreArchivedFormSubmissionResponse/);
  assert.match(analyticsDashboard, /permanentlyDeleteFormSubmissionResponse/);
  assert.match(analyticsDashboard, /createFormSubmissionAdminComment/);
  assert.match(analyticsDashboard, /updateFormSubmissionAdminComment/);
  assert.match(analyticsDashboard, /deleteFormSubmissionAdminComment/);
  assert.match(analyticsDashboard, /Observaciones internas/);
  assert.match(analyticsDashboard, /Resumen de observaciones/);
  assert.match(rootActions, /submissionCount[\s\S]*\.eq\("is_archived", false\)/);
  assert.match(rootActions, /newCount[\s\S]*\.eq\("is_archived", false\)/);
});
