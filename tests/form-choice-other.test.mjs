import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  buildChoiceSubmissionValue,
  getChoiceEditState,
  getChoiceOtherTextKey,
  getChoiceAnalyticsValues,
  normalizeChoiceOtherOptions,
  validateChoiceOtherAnswers,
  validateChoiceOtherResponse,
} from "../lib/forms/choice-other.mjs";

const radioField = {
  id: "activity",
  label: "Actividad",
  type: "radio",
  options: [
    { id: "run", value: "run", label: "Correr" },
    { id: "other", value: "other", label: "Otra", allows_other: true },
  ],
};

const checkboxField = {
  id: "days",
  label: "Días",
  type: "checkbox",
  options: [
    { id: "friday", value: "friday", label: "Viernes" },
    { id: "other", value: "other", label: "Otro día", allows_other: true },
  ],
};

test("normalizes choice options so only one can allow a written response", () => {
  const options = normalizeChoiceOtherOptions([
    { id: "a", label: "A", allows_other: true },
    { id: "b", label: "B", allows_other: true },
    { id: "c", label: "C" },
  ]);

  assert.deepEqual(
    options.map((option) => Boolean(option.allows_other)),
    [true, false, false],
  );
});

test("requires non-empty text when the open radio option is selected", () => {
  assert.deepEqual(validateChoiceOtherResponse(radioField, "other", "   "), {
    valid: false,
    error: "Especifica la otra respuesta.",
  });
  assert.deepEqual(validateChoiceOtherResponse(radioField, "run", ""), {
    valid: true,
    error: null,
  });
});

test("requires non-empty text when the open checkbox option is selected", () => {
  assert.equal(
    validateChoiceOtherResponse(
      checkboxField,
      { friday: true, other: true },
      "",
    ).valid,
    false,
  );
  assert.equal(
    validateChoiceOtherResponse(
      checkboxField,
      { friday: true, other: false },
      "",
    ).valid,
    true,
  );
});

test("validates structured submission answers on the server", () => {
  assert.deepEqual(
    validateChoiceOtherAnswers(
      [radioField],
      [
        {
          field_id: "activity",
          value: "Otra",
          choice_options: ["Otra"],
          other_text: " ",
        },
      ],
    ),
    {
      valid: false,
      fieldLabels: ["Actividad"],
    },
  );
  assert.deepEqual(
    validateChoiceOtherAnswers(
      [radioField],
      [
        {
          field_id: "activity",
          value: "Correr",
          choice_options: ["Correr"],
          other_text: null,
        },
      ],
    ),
    {
      valid: true,
      fieldLabels: [],
    },
  );
});

test("serializes an open radio answer with compatible display value and metadata", () => {
  assert.deepEqual(buildChoiceSubmissionValue(radioField, "other", " Natación "), {
    value: "Otra: Natación",
    choice_options: ["Otra"],
    other_text: "Natación",
  });
});

test("serializes checkbox selections while preserving the open option metadata", () => {
  assert.deepEqual(
    buildChoiceSubmissionValue(
      checkboxField,
      { friday: true, other: true },
      "Domingo",
    ),
    {
      value: ["Viernes", "Otro día: Domingo"],
      choice_options: ["Viernes", "Otro día"],
      other_text: "Domingo",
    },
  );
});

test("restores editable values from choice metadata", () => {
  assert.deepEqual(
    getChoiceEditState(
      radioField,
      "Otra: Natación",
      { choice_options: ["Otra"], other_text: "Natación" },
    ),
    {
      value: "Otra",
      other_text: "Natación",
    },
  );
});

test("analytics group written answers under the configured option label", () => {
  assert.deepEqual(
    getChoiceAnalyticsValues(
      checkboxField,
      ["Viernes", "Otro día: Domingo"],
      { choice_options: ["Viernes", "Otro día"], other_text: "Domingo" },
    ),
    ["Viernes", "Otro día"],
  );
});

test("analytics translate legacy checkbox maps and option values to labels", () => {
  assert.deepEqual(
    getChoiceAnalyticsValues(
      checkboxField,
      { friday: true, other: false },
      {},
    ),
    ["Viernes"],
  );
  assert.deepEqual(
    getChoiceAnalyticsValues(radioField, "run", {}),
    ["Correr"],
  );
});

test("uses a stable companion key for the written response", () => {
  assert.equal(getChoiceOtherTextKey("activity"), "activity__other");
});

test("choice-other behavior is wired into builder, public form, manual entry, and analytics", () => {
  const questionCard = readFileSync(
    new URL("../components/admin/forms/builder/QuestionCard.jsx", import.meta.url),
    "utf8",
  );
  const renderer = readFileSync(
    new URL("../components/public/forms/fluent-renderer/FluentRenderer.jsx", import.meta.url),
    "utf8",
  );
  const manualForm = readFileSync(
    new URL("../components/admin/forms/ManualFinancialRegistrationForm.jsx", import.meta.url),
    "utf8",
  );
  const analytics = readFileSync(
    new URL("../components/admin/managers/AnalyticsDashboard.jsx", import.meta.url),
    "utf8",
  );
  const actions = readFileSync(
    new URL("../lib/actions.ts", import.meta.url),
    "utf8",
  );

  assert.match(questionCard, /allows_other/);
  assert.match(questionCard, /Respuesta escrita/);
  assert.match(renderer, /getChoiceOtherTextKey/);
  assert.match(renderer, /buildChoiceSubmissionValue/);
  assert.match(manualForm, /getChoiceOtherTextKey/);
  assert.match(analytics, /getChoiceAnalyticsValues/);
  assert.match(actions, /validateChoiceOtherAnswers/);
});
