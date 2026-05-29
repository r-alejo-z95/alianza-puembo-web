import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const migrationPath = new URL(
  "../supabase/migrations/20260529000000_add_lom_post_views.sql",
  import.meta.url,
);
const revokeMigrationPath = new URL(
  "../supabase/migrations/20260529001000_restrict_lom_post_view_increment.sql",
  import.meta.url,
);

test("lom view counter migration adds an atomic public-safe increment path", () => {
  assert.equal(existsSync(migrationPath), true);

  const source = readFileSync(migrationPath, "utf8");

  assert.match(source, /ALTER TABLE "public"\."lom_posts"/);
  assert.match(
    source,
    /ADD COLUMN IF NOT EXISTS "view_count" integer DEFAULT 0 NOT NULL/,
  );
  assert.match(source, /CHECK \("view_count" >= 0\)/);
  assert.match(
    source,
    /CREATE OR REPLACE FUNCTION "public"\."increment_lom_post_view"\("post_slug" text\) RETURNS integer/,
  );
  assert.match(source, /"view_count" = "view_count" \+ 1/);
  assert.match(source, /"slug" = "post_slug"/);
  assert.match(source, /"is_archived" = false/);
  assert.match(
    source,
    /"publication_date" <= \("now"\(\) AT TIME ZONE 'America\/Guayaquil'\)::date/,
  );
  assert.match(
    source,
    /REVOKE ALL ON FUNCTION "public"\."increment_lom_post_view"\(text\) FROM PUBLIC/,
  );
  assert.match(
    source,
    /GRANT EXECUTE ON FUNCTION "public"\."increment_lom_post_view"\(text\) TO "service_role"/,
  );
});

test("lom view increment function is not executable by public API roles", () => {
  assert.equal(existsSync(revokeMigrationPath), true);

  const source = readFileSync(revokeMigrationPath, "utf8");

  assert.match(
    source,
    /REVOKE ALL ON FUNCTION "public"\."increment_lom_post_view"\(text\) FROM PUBLIC/,
  );
  assert.match(
    source,
    /REVOKE ALL ON FUNCTION "public"\."increment_lom_post_view"\(text\) FROM "anon"/,
  );
  assert.match(
    source,
    /REVOKE ALL ON FUNCTION "public"\."increment_lom_post_view"\(text\) FROM "authenticated"/,
  );
  assert.match(
    source,
    /GRANT EXECUTE ON FUNCTION "public"\."increment_lom_post_view"\(text\) TO "service_role"/,
  );
});
