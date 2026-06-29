import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

async function loadFormUtils() {
  const source = readFileSync(new URL("../lib/form-utils.ts", import.meta.url), "utf8");
  const submissionNameModuleUrl = new URL(
    "../lib/forms/submission-name.mjs",
    import.meta.url,
  ).href;
  const tempDir = mkdtempSync(join(tmpdir(), "form-utils-"));
  const tempModule = join(tempDir, "form-utils.ts");
  const testableSource = source
    .replace(
      'import { normalizeFormKey } from "@/lib/form-response-history";',
      `function normalizeFormKey(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\\s+/g, " ");
}`,
    )
    .replace(
      'from "@/lib/forms/submission-name.mjs"',
      `from "${submissionNameModuleUrl}"`,
    );

  writeFileSync(tempModule, testableSource);
  return import(pathToFileURL(tempModule));
}

test("findNameInSubmission extracts a display name from structured participant values", async () => {
  const { findNameInSubmission } = await loadFormUtils();

  const name = findNameInSubmission({
    answers: [
      {
        label: "Participante",
        value: {
          index: 1,
          answers: {
            Nombre: "Ana Perez",
            Edad: "8",
          },
        },
      },
    ],
    data: {
      Participante: {
        index: 1,
        answers: {
          Nombre: "Ana Perez",
          Edad: "8",
        },
      },
    },
  });

  assert.equal(name, "Ana Perez");
});

test("findNameInSubmission falls back to Inscrito instead of uploaded file names", async () => {
  const { findNameInSubmission } = await loadFormUtils();

  const name = findNameInSubmission({
    answers: [
      {
        label: "Participante",
        value: {
          _type: "file",
          name: "comprobante-bancario.jpg",
          financial_receipt_path: "finance_receipts/forms/comprobante-bancario.jpg",
        },
      },
    ],
    data: {
      Participante: {
        _type: "file",
        name: "comprobante-bancario.jpg",
        financial_receipt_path: "finance_receipts/forms/comprobante-bancario.jpg",
      },
    },
  });

  assert.equal(name, "Inscrito");
});

test("findNameInSubmission reads the canonical participant_details column", async () => {
  const { findNameInSubmission } = await loadFormUtils();

  const name = findNameInSubmission({
    data: { "Nombre del padre o madre": "Representante" },
    answers: [],
    participant_details: [
      {
        index: 1,
        answers: {
          "Nombre del Niño/a Campista": "Ana Perez",
          Edad: "8",
        },
      },
      {
        index: 2,
        answers: {
          "Nombre del Niño/a Campista": "Luis Perez",
          Edad: "6",
        },
      },
    ],
  });

  assert.equal(name, "Ana Perez, Luis Perez");
  assert.doesNotMatch(name, /\[object Object\]/);
});
