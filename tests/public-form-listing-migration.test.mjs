import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

test("public form listing migration is opt-in and generated types expose it", () => {
  const migrationUrl = new URL(
    "../supabase/migrations/20260702000000_add_public_form_listing.sql",
    import.meta.url,
  );

  assert.equal(existsSync(migrationUrl), true);

  const migration = readFileSync(migrationUrl, "utf8");
  assert.match(migration, /alter table public\.forms/i);
  assert.match(
    migration,
    /is_publicly_listed boolean not null default false/i,
  );

  const types = readFileSync(
    new URL("../lib/database.types.ts", import.meta.url),
    "utf8",
  );
  assert.match(types, /is_publicly_listed: boolean/);
  assert.match(types, /is_publicly_listed\?: boolean/);
});
