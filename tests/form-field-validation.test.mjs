import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const validation = await import("../lib/forms/field-validation.mjs").catch(
  () => ({}),
);

function getExport(name) {
  assert.equal(
    typeof validation[name],
    "function",
    `${name} must be exported as a function`,
  );
  return validation[name];
}

test("required text rejects whitespace while an optional empty textarea passes", () => {
  const validateFieldValue = getExport("validateFieldValue");
  const createFieldValidationRule = getExport("createFieldValidationRule");

  assert.deepEqual(
    validateFieldValue(
      { id: "name", label: "Nombre", type: "text", required: true },
      "   ",
    ),
    { valid: false, error: "Este campo es obligatorio." },
  );
  assert.deepEqual(
    validateFieldValue(
      { id: "notes", label: "Notas", type: "textarea", required: false },
      "",
    ),
    { valid: true, error: null },
  );
  assert.equal(
    createFieldValidationRule({ type: "text", required: true })(""),
    "Este campo es obligatorio.",
  );
  assert.equal(
    createFieldValidationRule({ type: "textarea" })("contenido"),
    true,
  );
});

test("email validates non-empty optional values and permits an optional empty value", () => {
  const validateFieldValue = getExport("validateFieldValue");
  const field = { type: "email", required: false };

  assert.equal(validateFieldValue(field, "ana@example.com").valid, true);
  assert.deepEqual(validateFieldValue(field, "12345"), {
    valid: false,
    error: "Ingresa un correo electrónico válido.",
  });
  assert.equal(validateFieldValue(field, "   ").valid, true);
  assert.equal(validateFieldValue(field, "  ana@example.com  ").valid, true);
});

test("number accepts finite real syntax and rejects malformed or infinite values", () => {
  const validateFieldValue = getExport("validateFieldValue");
  const field = { type: "number" };

  for (const value of ["-12.5", "0", ".25", "1e3", 8]) {
    assert.equal(validateFieldValue(field, value).valid, true, String(value));
  }

  for (const value of ["12x", "Infinity", Number.POSITIVE_INFINITY, "--2"]) {
    assert.deepEqual(
      validateFieldValue(field, value),
      { valid: false, error: "Ingresa un número válido." },
      String(value),
    );
  }
});

test("date accepts only real ISO calendar dates", () => {
  const validateFieldValue = getExport("validateFieldValue");
  const field = { type: "date" };

  assert.equal(validateFieldValue(field, "2024-02-29").valid, true);
  assert.deepEqual(validateFieldValue(field, "2025-02-29"), {
    valid: false,
    error: "Ingresa una fecha válida.",
  });
  assert.equal(validateFieldValue(field, "02/28/2025").valid, false);
});

test("choice fields accept configured values, labels, and serialized open choices", () => {
  const validateFieldValue = getExport("validateFieldValue");
  const options = [
    { label: "Correr", value: "run" },
    { label: "Otra", value: "other", allows_other: true },
  ];
  const radio = { type: "radio", options };
  const select = { type: "select", options: JSON.stringify(options) };
  const checkbox = {
    type: "checkbox",
    required: true,
    options: [
      { label: "Viernes", value: "friday" },
      { label: "Sábado", value: "saturday" },
    ],
  };

  assert.equal(validateFieldValue(radio, "run").valid, true);
  assert.equal(validateFieldValue(select, "Correr").valid, true);
  assert.equal(validateFieldValue(select, "Otra: Natación").valid, true);
  assert.deepEqual(validateFieldValue(select, "Desconocida"), {
    valid: false,
    error: "Selecciona una opción válida.",
  });
  assert.equal(
    validateFieldValue(checkbox, { friday: true, saturday: false }).valid,
    true,
  );
  assert.equal(
    validateFieldValue(checkbox, ["Viernes", "saturday"]).valid,
    true,
  );
  assert.deepEqual(validateFieldValue(checkbox, ["Domingo"]), {
    valid: false,
    error: "Selecciona al menos una opción válida.",
  });
  assert.deepEqual(validateFieldValue(checkbox, []), {
    valid: false,
    error: "Este campo es obligatorio.",
  });
});

test("image and file fields enforce supported MIME types and the five MiB limit", () => {
  const validateFieldValue = getExport("validateFieldValue");
  assert.equal(
    validation.MAX_FORM_FILE_SIZE_BYTES,
    5 * 1024 * 1024,
    "MAX_FORM_FILE_SIZE_BYTES must be exported",
  );

  const png = { type: "image/png", size: 1024 };
  const pdf = { mime_type: "application/pdf", size_bytes: 2048 };
  const oversized = {
    type: "image/jpeg",
    size: validation.MAX_FORM_FILE_SIZE_BYTES + 1,
  };

  assert.equal(validateFieldValue({ type: "image" }, png).valid, true);
  assert.deepEqual(validateFieldValue({ type: "image" }, pdf), {
    valid: false,
    error: "Selecciona una imagen válida.",
  });
  assert.equal(
    validateFieldValue({ type: "file" }, { 0: pdf, length: 1 }).valid,
    true,
  );
  assert.deepEqual(validateFieldValue({ type: "file" }, oversized), {
    valid: false,
    error: "El archivo no puede superar 5 MB.",
  });

  for (const type of [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
  ]) {
    assert.equal(
      validateFieldValue({ type: "image" }, { type, size: 1 }).valid,
      true,
      type,
    );
  }
});

test("structured answers match fields by id or label and return exact errors", () => {
  const validateSubmissionAnswers = getExport("validateSubmissionAnswers");
  const fields = [
    { id: "email", label: "Correo", type: "email" },
    { id: "quantity", label: "Cantidad", type: "number" },
    {
      id: "destination",
      label: "Destino",
      field_type: "select",
      options: [{ label: "Puembo", value: "puembo" }],
    },
    { id: "heading", label: "Información", type: "section", required: true },
  ];
  const answers = [
    { field_id: "email", label: "Correo anterior", value: "incorrecto" },
    { label: "Cantidad", value: "-8.25e2" },
    { field_id: "destination", value: "Quito" },
  ];

  assert.deepEqual(validateSubmissionAnswers(fields, answers), {
    valid: false,
    errors: [
      {
        fieldId: "email",
        label: "Correo",
        message: "Ingresa un correo electrónico válido.",
      },
      {
        fieldId: "destination",
        label: "Destino",
        message: "Selecciona una opción válida.",
      },
    ],
  });
});

test("public renderer wires shared validation into fields and participant inputs", () => {
  const renderer = readFileSync(
    new URL(
      "../components/public/forms/fluent-renderer/FluentRenderer.jsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(renderer, /createFieldValidationRule/);
  assert.match(renderer, /validateFieldValue/);
  assert.match(renderer, /type="text"\s+inputMode="decimal"/);
  assert.match(
    renderer,
    /const isNumberField = templateField\.type === "number"/,
  );
  assert.match(
    renderer,
    /inputMode=\{isNumberField \? "decimal" : undefined\}/,
  );
  assert.doesNotMatch(renderer, /step=/);
  assert.match(
    renderer,
    /errors\[field\.id \|\| field\.label\]\?\.message/,
  );
  assert.match(renderer, /errors\[name\]\?\.message/);
});

test("submit action validates stored field definitions before inserting", () => {
  const actions = readFileSync(
    new URL("../lib/actions.ts", import.meta.url),
    "utf8",
  );

  assert.match(actions, /validateSubmissionAnswers/);
  assert.match(
    actions,
    /form_fields!form_id\(id, label, type, required, options\)/,
  );
  assert.match(
    actions,
    /validateFieldValue\(\s*\{ type: "email", required: !form\.is_internal \}/,
  );
  assert.match(actions, /Revisa tus respuestas/);
});
