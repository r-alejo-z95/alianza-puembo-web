import test from "node:test";
import assert from "node:assert/strict";

import {
  buildPricingSnapshot,
  buildPricingFieldOptions,
  calculateGroupExpectedAmount,
  flattenParticipantDetailsForExport,
  getEffectiveExpectedAmount,
  normalizePricingPackages,
  validatePricingConfiguration,
} from "../lib/finance/pricing-packages.mjs";

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
