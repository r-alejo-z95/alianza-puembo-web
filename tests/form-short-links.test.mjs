import test from "node:test";
import assert from "node:assert/strict";

import {
  applyShortCodeSuffix,
  findAvailableFormShortCode,
  generateFormShortCode,
  getFormShortUrl,
  isValidFormShortCode,
  normalizeFormShortCode,
} from "../lib/forms/short-links.mjs";

test("generateFormShortCode creates readable codes from Spanish form titles", () => {
  assert.equal(generateFormShortCode("Retiro Finanzas Inteligentes"), "ret-fin-int");
  assert.equal(generateFormShortCode("Formulario de inscripción para GP"), "ins-gp");
  assert.equal(generateFormShortCode("Campamento de jóvenes 2026"), "cam-jov-2026");
  assert.equal(generateFormShortCode("Encuentro Matrimonios Puembo"), "enc-mat-pue");
});

test("generateFormShortCode falls back when a title has no useful words", () => {
  assert.equal(generateFormShortCode("de la y para"), "form");
  assert.equal(generateFormShortCode("GP"), "gp-form");
});

test("normalizeFormShortCode creates url-safe lowercase codes", () => {
  assert.equal(normalizeFormShortCode(" Ret Fin Int!! "), "ret-fin-int");
  assert.equal(normalizeFormShortCode("Ñiños / Jóvenes 2026"), "ninos-jovenes-2026");
});

test("isValidFormShortCode enforces the database format", () => {
  assert.equal(isValidFormShortCode("ret-fin-int"), true);
  assert.equal(isValidFormShortCode("abc"), true);
  assert.equal(isValidFormShortCode("RetFin"), false);
  assert.equal(isValidFormShortCode("ab"), false);
  assert.equal(isValidFormShortCode("-abc"), false);
  assert.equal(isValidFormShortCode("abc-"), false);
  assert.equal(isValidFormShortCode("abc__def"), false);
});

test("applyShortCodeSuffix preserves the 40 character limit", () => {
  assert.equal(applyShortCodeSuffix("ret-fin-int", 2), "ret-fin-int-2");
  assert.equal(applyShortCodeSuffix("abcdefghijklmnopqrstuvwxyz-abcdefghijk", 12).length, 40);
});

test("getFormShortUrl builds a full short url from an origin", () => {
  assert.equal(
    getFormShortUrl("ret-fin-int", "https://www.alianzapuembo.org/"),
    "https://www.alianzapuembo.org/f/ret-fin-int",
  );
});

test("findAvailableFormShortCode appends a suffix when a candidate already exists", async () => {
  const usedCodes = new Set(["ret-fin-int", "ret-fin-int-2"]);
  const supabase = {
    from() {
      return {
        select() {
          return this;
        },
        eq(_column, value) {
          this.value = value;
          return this;
        },
        neq() {
          return this;
        },
        limit() {
          return this;
        },
        async maybeSingle() {
          return {
            data: usedCodes.has(this.value) ? { id: "existing" } : null,
            error: null,
          };
        },
      };
    },
  };

  assert.equal(await findAvailableFormShortCode(supabase, "Retiro Finanzas Inteligentes"), "ret-fin-int-3");
});
