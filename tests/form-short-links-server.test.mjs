import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

test("form data layer can resolve forms by short code", () => {
  const source = readFileSync(new URL("../lib/data/forms.ts", import.meta.url), "utf8");

  assert.match(source, /short_code\?: string \| null/);
  assert.match(source, /export async function getFormByShortCode/);
  assert.match(source, /\.eq\("short_code", normalizedShortCode\)/);
  assert.match(source, /\.eq\("is_archived", false\)/);
});

test("form actions generate and update short codes", () => {
  const source = readFileSync(new URL("../lib/actions/forms.ts", import.meta.url), "utf8");

  assert.match(source, /findAvailableFormShortCode/);
  assert.match(source, /payload\.short_code = await findAvailableFormShortCode\(supabase, values\.title\)/);
  assert.match(source, /export async function updateFormShortCode/);
  assert.match(source, /normalizeFormShortCode/);
  assert.match(source, /isReservedFormShortCode/);
  assert.match(source, /isValidFormShortCode/);
  assert.match(source, /Ese link corto está reservado por otra sección del sitio\./);
  assert.match(source, /forms_short_code_unique_idx|23505/);
  assert.match(source, /await revalidateForms\(\)/);
});

test("builder direct insert path also creates a short code", () => {
  const source = readFileSync(new URL("../app/admin/formularios/builder/page.js", import.meta.url), "utf8");

  assert.match(source, /findAvailableFormShortCode/);
  assert.match(source, /const shortCode = await findAvailableFormShortCode\(supabase, title\)/);
  assert.match(source, /short_code: shortCode/);
});

test("short link route redirects public and internal forms to canonical routes", () => {
  const routePath = new URL("../app/f/[shortCode]/page.js", import.meta.url);
  assert.equal(existsSync(routePath), true);

  const source = readFileSync(routePath, "utf8");
  assert.match(source, /getFormByShortCode/);
  assert.match(source, /notFound\(\)/);
  assert.match(source, /redirect\(`\/admin\/staff\/proceso\/\$\{form\.slug\}`\)/);
  assert.match(source, /redirect\(`\/formularios\/\$\{form\.slug\}`\)/);
});

test("root short link route redirects public and internal forms to canonical routes", () => {
  const routePath = new URL("../app/[shortCode]/page.js", import.meta.url);
  assert.equal(existsSync(routePath), true);

  const source = readFileSync(routePath, "utf8");
  assert.match(source, /getFormByShortCode/);
  assert.match(source, /notFound\(\)/);
  assert.match(source, /redirect\(`\/admin\/staff\/proceso\/\$\{form\.slug\}`\)/);
  assert.match(source, /redirect\(`\/formularios\/\$\{form\.slug\}`\)/);
});
