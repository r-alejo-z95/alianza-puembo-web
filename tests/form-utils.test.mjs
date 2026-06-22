import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

async function loadFormUtils() {
  const source = readFileSync(new URL("../lib/form-utils.ts", import.meta.url), "utf8");
  const tempDir = mkdtempSync(join(tmpdir(), "form-utils-"));
  const tempModule = join(tempDir, "form-utils.ts");
  const testableSource = source.replace(
    'import { normalizeFormKey } from "@/lib/form-response-history";',
    `function normalizeFormKey(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\\s+/g, " ");
}`,
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
