import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const containmentUrl = new URL(
  "../supabase/migrations/20260706000000_lock_down_retired_google_integration.sql",
  import.meta.url,
);

test("retired Google integration removes public token access", () => {
  assert.equal(existsSync(containmentUrl), true);
  const migration = readFileSync(containmentUrl, "utf8");

  assert.match(
    migration,
    /drop policy if exists "Enable read access for all users"/i,
  );
  assert.match(
    migration,
    /revoke all privileges[\s\S]*from public, anon, authenticated/i,
  );
  assert.match(migration, /delete from public\.google_integration/i);
});
