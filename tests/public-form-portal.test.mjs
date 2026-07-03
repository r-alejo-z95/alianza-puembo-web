import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildPublicFormSummary,
  filterPublicFormListings,
  normalizePortalSearch,
  preparePublicFormListings,
} from "../lib/forms/public-portal.mjs";

const forms = [
  {
    id: "open",
    title: "Celebración de Graduados",
    description: "<p>Un encuentro para celebrar juntos.</p>",
    enabled: true,
    is_financial: false,
    created_at: "2026-07-02T00:00:00Z",
  },
  {
    id: "closed",
    title: "Retiro MAT",
    description:
      "<p>Debes realizar un pago único de $30.</p><p><strong>Banco:</strong> Pichincha</p>",
    enabled: false,
    is_financial: true,
    created_at: "2026-06-30T00:00:00Z",
  },
];

test("portal search normalization ignores accents, case, and repeated spaces", () => {
  assert.equal(
    normalizePortalSearch("  CELEBRACIÓN   Jóvenes "),
    "celebracion jovenes",
  );
});

test("public summaries strip HTML and payment-only copy", () => {
  assert.equal(
    buildPublicFormSummary(
      "<p>Un encuentro para <strong>celebrar</strong> juntos.</p>",
    ),
    "Un encuentro para celebrar juntos.",
  );
  assert.equal(
    buildPublicFormSummary(
      "<p>Debes realizar un pago único de $30.</p><p><strong>Banco:</strong> Pichincha</p>",
    ),
    "Conoce los detalles y completa tu inscripción.",
  );
});

test("portal preparation keeps closed forms for lookup but not catalog", () => {
  const result = preparePublicFormListings(forms);

  assert.deepEqual(
    result.catalogForms.map((form) => form.id),
    ["open"],
  );
  assert.deepEqual(
    result.lookupForms.map((form) => form.id),
    ["open", "closed"],
  );
  assert.equal(
    result.lookupForms.every(
      (form) => !Object.prototype.hasOwnProperty.call(form, "description"),
    ),
    true,
  );
});

test("catalog search matches normalized title and summary", () => {
  const { catalogForms } = preparePublicFormListings(forms);

  assert.deepEqual(
    filterPublicFormListings(catalogForms, "graduados").map(
      (form) => form.id,
    ),
    ["open"],
  );
  assert.deepEqual(
    filterPublicFormListings(catalogForms, "CELEBRACIÓN").map(
      (form) => form.id,
    ),
    ["open"],
  );
  assert.deepEqual(
    filterPublicFormListings(catalogForms, "retiro").map((form) => form.id),
    [],
  );
});

test("public portal data only fetches explicitly listed public forms", () => {
  const source = readFileSync(
    new URL("../lib/data/forms.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /export async function getPubliclyListedForms/);
  assert.match(source, /\.eq\("is_publicly_listed", true\)/);
  assert.match(source, /\.eq\("is_internal", false\)/);
  assert.match(source, /\.eq\("is_archived", false\)/);
  assert.match(
    source,
    /id, title, slug, description, image_url, enabled, closed_by_limit, is_financial, created_at, is_publicly_listed/,
  );
});
