import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  buildManualAnswers,
  buildManualData,
  validateManualRegistrationValues,
  validateManualFinancialForm,
} from "../lib/finance/manual-registration.mjs";

test("buildManualAnswers preserves checkbox selections as an option map", () => {
  const fields = [
    {
      id: "attendance",
      label: "Asistencia",
      type: "checkbox",
      options: [
        { label: "Viernes", value: "viernes" },
        { label: "Sabado", value: "sabado" },
      ],
      order_index: 1,
    },
  ];

  const values = {
    attendance: {
      viernes: true,
      sabado: false,
    },
  };

  const answers = buildManualAnswers(fields, values);

  assert.deepEqual(answers, [
    {
      field_id: "attendance",
      key: "attendance",
      label: "Asistencia",
      value: {
        viernes: true,
        sabado: false,
      },
      order_index: 1,
    },
  ]);
});

test("validateManualRegistrationValues reports missing required text and checkbox fields", () => {
  const fields = [
    { id: "name", label: "Nombre", type: "text", required: true },
    {
      id: "attendance",
      label: "Asistencia",
      type: "checkbox",
      required: true,
      options: [
        { label: "Viernes", value: "viernes" },
        { label: "Sabado", value: "sabado" },
      ],
    },
  ];

  const result = validateManualRegistrationValues(fields, {
    name: "",
    attendance: {
      viernes: false,
      sabado: false,
    },
  });

  assert.equal(result.valid, false);
  assert.deepEqual(result.missingFieldLabels, ["Nombre", "Asistencia"]);
});

test("buildManualData keeps normalized field values for manual submissions", () => {
  const fields = [
    { id: "name", label: "Nombre", type: "text" },
    {
      id: "attendance",
      label: "Asistencia",
      type: "checkbox",
      options: [
        { label: "Viernes", value: "viernes" },
        { label: "Sabado", value: "sabado" },
      ],
    },
  ];

  const values = {
    name: "Ramon",
    attendance: {
      viernes: true,
      sabado: false,
    },
  };

  assert.deepEqual(buildManualData(fields, values), {
    Nombre: "Ramon",
    Asistencia: {
      viernes: true,
      sabado: false,
    },
  });
});

test("validateManualFinancialForm rejects non-financial or archived forms", () => {
  assert.equal(
    validateManualFinancialForm({ id: "a", is_financial: false, is_archived: false }).valid,
    false,
  );
  assert.equal(
    validateManualFinancialForm({ id: "a", is_financial: true, is_archived: true }).valid,
    false,
  );
  assert.equal(
    validateManualFinancialForm({ id: "a", is_financial: true, is_archived: false }).valid,
    true,
  );
});

test("createManualFinancialRegistration disambiguates the forms to form_fields relation", () => {
  const financeActions = readFileSync(new URL("../lib/actions/finance.ts", import.meta.url), "utf8");

  assert.match(financeActions, /\.select\("id, is_financial, is_archived, form_fields!form_id\(\*\)"\)/);
});
