import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  buildPricingSnapshot,
  buildPricingFieldOptions,
  calculateGroupExpectedAmount,
  flattenParticipantDetailsForExport,
  getEffectiveExpectedAmount,
  normalizePricingPackages,
  validatePricingConfiguration,
} from "../lib/finance/pricing-packages.mjs";
import {
  buildParticipantColumns,
  getParticipantSearchValues,
  validateParticipantDetails,
} from "../lib/forms/participant-details.mjs";

test("validates and normalizes participant details against package count and template", () => {
  const result = validateParticipantDetails({
    participantDetails: [
      { index: 1, answers: { Nombre: " Ana ", Edad: "8", Ignorado: "x" } },
      { index: 2, answers: { Nombre: "Luis", Edad: 6 } },
    ],
    participantTemplate: [
      { id: "name", label: "Nombre", required: true },
      { id: "age", label: "Edad", required: true },
    ],
    expectedCount: 2,
  });

  assert.deepEqual(result, {
    valid: true,
    errors: [],
    value: [
      { index: 1, answers: { Nombre: "Ana", Edad: "8" } },
      { index: 2, answers: { Nombre: "Luis", Edad: "6" } },
    ],
  });
});

test("rejects missing participant rows and required answers", () => {
  const result = validateParticipantDetails({
    participantDetails: [{ index: 1, answers: { Nombre: "" } }],
    participantTemplate: [{ id: "name", label: "Nombre", required: true }],
    expectedCount: 2,
  });

  assert.equal(result.valid, false);
  assert.deepEqual(result.errors, [
    "Se esperaban 2 participantes y se recibieron 1.",
    "Participante 1: falta Nombre.",
  ]);
});

test("builds participant columns and searchable values", () => {
  const details = [
    { index: 1, answers: { Nombre: "Ana", Edad: "8" } },
    { index: 2, answers: { Nombre: "Luis", Edad: "6" } },
  ];

  assert.deepEqual(buildParticipantColumns(details), {
    "Participante 1 - Nombre": "Ana",
    "Participante 1 - Edad": "8",
    "Participante 2 - Nombre": "Luis",
    "Participante 2 - Edad": "6",
  });
  assert.deepEqual(getParticipantSearchValues(details), ["Ana", "8", "Luis", "6"]);
});

test("normalizes pricing packages with stable enabled options", () => {
  const packages = normalizePricingPackages([
    { id: "pkg-1", label: "  1 niño  ", amount: "80", participant_count: "1" },
    { id: "pkg-2", label: "2 niños", amount: 140, participant_count: 2, enabled: false },
    { id: "", label: "", amount: -1 },
  ]);

  assert.deepEqual(packages, [
    { id: "pkg-1", label: "1 niño", amount: 80, participant_count: 1, enabled: true },
    { id: "pkg-2", label: "2 niños", amount: 140, participant_count: 2, enabled: false },
  ]);
});

test("validates package mode requires active positive packages", () => {
  assert.deepEqual(validatePricingConfiguration({ pricing_mode: "fixed", total_amount: 25 }), {
    valid: true,
    errors: [],
  });

  assert.deepEqual(validatePricingConfiguration({ pricing_mode: "packages", pricing_packages: [] }), {
    valid: false,
    errors: ["Agrega al menos un paquete de precio activo."],
  });

  assert.deepEqual(
    validatePricingConfiguration({
      pricing_mode: "packages",
      collect_participant_details: true,
      pricing_packages: [{ id: "pkg-1", label: "1 niño", amount: 80, enabled: true }],
      participant_template: [],
    }),
    {
      valid: false,
      errors: ["Agrega al menos un campo para los datos por participante."],
    },
  );
});

test("builds pricing field options from active packages", () => {
  assert.deepEqual(
    buildPricingFieldOptions([
      { id: "pkg-1", label: "1 niño", amount: 80, participant_count: 1, enabled: true },
      { id: "pkg-2", label: "2 niños", amount: 140, participant_count: 2, enabled: false },
    ]),
    [{ id: "pkg-1", value: "pkg-1", label: "1 niño - $80.00" }],
  );
});

test("builds immutable pricing snapshot from selected package", () => {
  const snapshot = buildPricingSnapshot({
    form: {
      pricing_mode: "packages",
      pricing_packages: [
        { id: "pkg-1", label: "1 niño", amount: 80, participant_count: 1, enabled: true },
      ],
    },
    selectedPackageId: "pkg-1",
  });

  assert.deepEqual(snapshot, {
    mode: "packages",
    package_id: "pkg-1",
    package_label: "1 niño",
    amount: 80,
    participant_count: 1,
  });
});

test("rejects inactive selected package", () => {
  assert.throws(
    () =>
      buildPricingSnapshot({
        form: {
          pricing_mode: "packages",
          pricing_packages: [{ id: "pkg-1", label: "1 niño", amount: 80, enabled: false }],
        },
        selectedPackageId: "pkg-1",
      }),
    /La opción de inscripción ya no está disponible/,
  );
});

test("effective expected amount prefers group, then submission, then fixed form amount", () => {
  assert.equal(
    getEffectiveExpectedAmount({
      form: { total_amount: 100 },
      submission: { expected_amount: 80 },
      paymentGroup: { expected_amount: 140 },
    }),
    140,
  );
  assert.equal(
    getEffectiveExpectedAmount({
      form: { total_amount: 100 },
      submission: { expected_amount: 80 },
      paymentGroup: null,
    }),
    80,
  );
  assert.equal(
    getEffectiveExpectedAmount({
      form: { total_amount: 100 },
      submission: {},
      paymentGroup: null,
    }),
    100,
  );
});

test("calculates group expected amount from active linked submissions", () => {
  assert.equal(
    calculateGroupExpectedAmount([
      { expected_amount: 80, is_archived: false, submission_status: "active" },
      { expected_amount: 140, is_archived: false, submission_status: "reviewed" },
      { expected_amount: 20, is_archived: true, submission_status: "active" },
      { expected_amount: 30, is_archived: false, submission_status: "cancelled" },
    ]),
    220,
  );
});

test("flattens participant details for exports", () => {
  const flattened = flattenParticipantDetailsForExport([
    { index: 1, answers: { Nombre: "Ana", Edad: "8" } },
    { index: 2, answers: { Nombre: "Luis", Edad: "6" } },
  ]);

  assert.deepEqual(flattened, {
    "Niño 1 - Nombre": "Ana",
    "Niño 1 - Edad": "8",
    "Niño 2 - Nombre": "Luis",
    "Niño 2 - Edad": "6",
  });
});

test("pricing packages migration adds form, submission, and payment group columns", () => {
  const migration = readFileSync(
    new URL("../supabase/migrations/20260616000000_add_form_pricing_packages.sql", import.meta.url),
    "utf8",
  );

  assert.match(migration, /add column if not exists pricing_mode text not null default 'fixed'/);
  assert.match(migration, /add column if not exists pricing_packages jsonb not null default '\[\]'::jsonb/);
  assert.match(migration, /add column if not exists expected_amount numeric\(12,2\)/);
  assert.match(migration, /add column if not exists pricing_snapshot jsonb/);
  assert.match(migration, /add column if not exists calculated_expected_amount numeric\(12,2\)/);
  assert.match(migration, /add column if not exists expected_amount_source text not null default 'manual'/);
});

test("form setup completion accepts package pricing without total_amount", () => {
  const setup = readFileSync(new URL("../lib/forms/setup.ts", import.meta.url), "utf8");

  assert.match(setup, /pricing_mode/);
  assert.match(setup, /validatePricingConfiguration/);
  assert.match(setup, /pricing_packages/);
});

test("saveFormSetup persists pricing package fields", () => {
  const actions = readFileSync(new URL("../lib/actions/forms.ts", import.meta.url), "utf8");

  assert.match(actions, /pricing_mode/);
  assert.match(actions, /pricing_packages/);
  assert.match(actions, /collect_participant_details/);
  assert.match(actions, /participant_template/);
  assert.match(actions, /validatePricingConfiguration/);
});

test("builder synchronizes automatic pricing field", () => {
  const builderPage = readFileSync(
    new URL("../app/admin/formularios/builder/page.js", import.meta.url),
    "utf8",
  );

  assert.match(builderPage, /syncPricingField/);
  assert.match(builderPage, /pricing_field_id/);
  assert.match(builderPage, /buildPricingFieldOptions/);
  assert.match(builderPage, /Selecciona tu opción de inscripción|Selecciona tu opcion de inscripcion/);
});

test("submitFormAction stores expected amount and pricing snapshot", () => {
  const actions = readFileSync(new URL("../lib/actions.ts", import.meta.url), "utf8");

  assert.match(actions, /buildPricingSnapshot/);
  assert.match(actions, /expected_amount:\s*pricingSnapshot\.amount/);
  assert.match(actions, /pricing_snapshot:\s*pricingSnapshot/);
  assert.match(actions, /participant_details:\s*participantDetails/);
});
