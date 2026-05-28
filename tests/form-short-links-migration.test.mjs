import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const migrationPath = new URL(
  "../supabase/migrations/20260528013000_add_form_short_codes.sql",
  import.meta.url,
);

test("short code migration adds backfilled constrained form short codes", () => {
  assert.equal(existsSync(migrationPath), true);

  const sql = readFileSync(migrationPath, "utf8");
  assert.match(sql, /alter table public\.forms\s+add column if not exists short_code text/i);
  assert.match(sql, /update public\.forms/i);
  assert.match(sql, /where f\.short_code is null/i);
  assert.match(sql, /forms_short_code_format_check/i);
  assert.match(sql, /forms_short_code_unique_idx/i);
  assert.match(sql, /\^\[a-z0-9\]\+\(-\[a-z0-9\]\+\)\*\$/);
});
