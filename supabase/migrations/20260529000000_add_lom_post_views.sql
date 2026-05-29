ALTER TABLE "public"."lom_posts"
  ADD COLUMN IF NOT EXISTS "view_count" integer DEFAULT 0 NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "pg_constraint"
    WHERE "conname" = 'lom_posts_view_count_nonnegative'
  ) THEN
    ALTER TABLE "public"."lom_posts"
      ADD CONSTRAINT "lom_posts_view_count_nonnegative"
      CHECK ("view_count" >= 0);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION "public"."increment_lom_post_view"("post_slug" text) RETURNS integer
    LANGUAGE "plpgsql"
    SECURITY DEFINER
    SET "search_path" = 'public'
    AS $$
DECLARE
  "new_count" integer;
BEGIN
  UPDATE "public"."lom_posts"
  SET "view_count" = "view_count" + 1
  WHERE "slug" = "post_slug"
    AND "is_archived" = false
    AND "publication_date" <= ("now"() AT TIME ZONE 'America/Guayaquil')::date
  RETURNING "view_count" INTO "new_count";

  RETURN "new_count";
END;
$$;

ALTER FUNCTION "public"."increment_lom_post_view"(text) OWNER TO "postgres";

REVOKE ALL ON FUNCTION "public"."increment_lom_post_view"(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION "public"."increment_lom_post_view"(text) TO "service_role";
