


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."financial_status_type" AS ENUM (
    'pending',
    'verified',
    'rejected',
    'manual_review'
);


ALTER TYPE "public"."financial_status_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_form_financial_summary"("target_form_id" "uuid") RETURNS TABLE("total_submissions" bigint, "verified_submissions" bigint, "total_amount" numeric)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE financial_status = 'verified'),
        COALESCE(SUM((financial_data->>'amount')::DECIMAL) FILTER (WHERE financial_status = 'verified'), 0)
    FROM form_submissions
    WHERE form_id = target_form_id;
END;
$$;


ALTER FUNCTION "public"."get_form_financial_summary"("target_form_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email
  );
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
  begin
    new.updated_at = now();
    return new;
  end;
  $$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_profile_from_auth"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, updated_at)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    updated_at = now();

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_profile_from_auth"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."bank_accounts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "bank_name" "text" NOT NULL,
    "account_holder" "text" NOT NULL,
    "account_number" "text" NOT NULL,
    "account_type" "text" NOT NULL,
    "notes" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "ruc" "text"
);


ALTER TABLE "public"."bank_accounts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bank_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "filename" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "status" "text" DEFAULT 'active'::"text",
    "bank_account_id" "uuid"
);


ALTER TABLE "public"."bank_reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bank_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "report_id" "uuid",
    "date" "date" NOT NULL,
    "amount" numeric(12,2) NOT NULL,
    "description" "text",
    "reference" "text",
    "bank_name" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."bank_transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contact_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "message" "text" NOT NULL,
    "status" "text" DEFAULT 'unread'::"text",
    "reply_content" "text",
    "replied_at" timestamp with time zone,
    "replied_by" "uuid",
    "is_archived" boolean DEFAULT false,
    "archived_at" timestamp with time zone,
    CONSTRAINT "contact_messages_status_check" CHECK (("status" = ANY (ARRAY['unread'::"text", 'read'::"text", 'replied'::"text"])))
);


ALTER TABLE "public"."contact_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone,
    "poster_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid",
    "registration_link" "text",
    "poster_w" numeric,
    "poster_h" numeric,
    "form_id" "uuid",
    "create_form" boolean DEFAULT false,
    "all_day" boolean DEFAULT false,
    "color" "text",
    "location" "text",
    "is_multi_day" boolean DEFAULT false,
    "slug" "text",
    "is_recurring" boolean DEFAULT false,
    "recurrence_pattern" "text",
    "is_archived" boolean DEFAULT false NOT NULL,
    "archived_at" timestamp with time zone,
    CONSTRAINT "events_recurrence_pattern_check" CHECK ((("recurrence_pattern" = ANY (ARRAY['weekly'::"text", 'biweekly'::"text", 'monthly'::"text", 'yearly'::"text"])) OR ("recurrence_pattern" IS NULL)))
);


ALTER TABLE "public"."events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."form_fields" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "form_id" "uuid" NOT NULL,
    "type" "text" DEFAULT 'text'::"text" NOT NULL,
    "label" "text" NOT NULL,
    "options" "jsonb" DEFAULT '[]'::"jsonb",
    "required" boolean DEFAULT false,
    "order_index" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "validation" "jsonb" DEFAULT '{}'::"jsonb",
    "placeholder" "text",
    "help_text" "text",
    "width" "text" DEFAULT 'full'::"text",
    "attachment_url" "text",
    "attachment_type" "text",
    "next_section_id" "text",
    CONSTRAINT "form_fields_type_check" CHECK (("type" = ANY (ARRAY['text'::"text", 'textarea'::"text", 'number'::"text", 'email'::"text", 'select'::"text", 'multiselect'::"text", 'radio'::"text", 'checkbox'::"text", 'date'::"text", 'time'::"text", 'file'::"text", 'image'::"text", 'section_header'::"text", 'section'::"text", 'separator'::"text"])))
);


ALTER TABLE "public"."form_fields" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."form_submission_admin_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "submission_id" "uuid" NOT NULL,
    "body" "text" NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "form_submission_admin_comments_body_not_blank" CHECK (("length"("btrim"("body")) > 0))
);


ALTER TABLE "public"."form_submission_admin_comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."form_submission_payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "submission_id" "uuid" NOT NULL,
    "bank_transaction_id" "uuid",
    "receipt_path" "text",
    "amount_claimed" numeric(12,2) DEFAULT 0,
    "status" "text" DEFAULT 'pending'::"text",
    "reconciliation_notes" "text",
    "extracted_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "manual_disposition" "text",
    "manual_disposition_at" timestamp with time zone,
    "manual_disposition_by" "uuid",
    "manual_disposition_notes" "text",
    CONSTRAINT "form_submission_payments_manual_disposition_check" CHECK ((("manual_disposition" IS NULL) OR ("manual_disposition" = ANY (ARRAY['incorrecto'::"text", 'duplicado'::"text"]))))
);


ALTER TABLE "public"."form_submission_payments" OWNER TO "postgres";


COMMENT ON COLUMN "public"."form_submission_payments"."manual_disposition" IS 'Manual finance discard reason: incorrecto or duplicado';



CREATE TABLE IF NOT EXISTS "public"."form_submissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "form_id" "uuid" NOT NULL,
    "data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "user_agent" "text",
    "ip_address" "text",
    "status" "text" DEFAULT 'submitted'::"text",
    "user_id" "uuid",
    "is_archived" boolean DEFAULT false,
    "archived_at" timestamp with time zone,
    "external_activity_name" "text",
    "access_token" "text" DEFAULT "replace"(("gen_random_uuid"())::"text", '-'::"text", ''::"text"),
    "notification_email" "text",
    "admin_notes" "text",
    "is_manual" boolean DEFAULT false NOT NULL,
    "submission_status" "text" DEFAULT 'active'::"text" NOT NULL,
    "answers" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "coverage_mode" "text",
    "coverage_amount" numeric(10,2),
    "coverage_created_at" timestamp with time zone,
    "coverage_created_by" "uuid",
    "coverage_backup_path" "text",
    "covered_by_submission_id" "uuid",
    CONSTRAINT "form_submissions_coverage_mode_check" CHECK ((("coverage_mode" IS NULL) OR ("coverage_mode" = ANY (ARRAY['bank_receipt'::"text", 'cash'::"text", 'card'::"text", 'scholarship'::"text", 'covered_by_used_payment'::"text"])))),
    CONSTRAINT "form_submissions_submission_status_check" CHECK (("submission_status" = ANY (ARRAY['active'::"text", 'reviewed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."form_submissions" OWNER TO "postgres";


COMMENT ON COLUMN "public"."form_submissions"."coverage_mode" IS 'Derived financial coverage mode for analytics and admin views';



CREATE TABLE IF NOT EXISTS "public"."forms" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "image_url" "text",
    "google_sheet_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid",
    "slug" "text",
    "google_drive_folder_id" "text",
    "google_sheet_url" "text",
    "enabled" boolean DEFAULT true,
    "is_archived" boolean DEFAULT false NOT NULL,
    "archived_at" timestamp with time zone,
    "is_internal" boolean DEFAULT false,
    "is_financial" boolean DEFAULT false,
    "financial_field_label" "text",
    "total_confirmed_balance" numeric(12,2) DEFAULT 0.00,
    "last_synced_at" timestamp with time zone,
    "max_responses" integer,
    "closed_by_limit" boolean DEFAULT false NOT NULL,
    "financial_field_id" "uuid",
    "payment_type" "text",
    "max_installments" integer,
    "total_amount" numeric(10,2),
    "destination_account_id" "uuid",
    CONSTRAINT "forms_payment_type_check" CHECK (("payment_type" = ANY (ARRAY['single'::"text", 'installments'::"text"])))
);


ALTER TABLE "public"."forms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."google_integration" (
    "id" bigint NOT NULL,
    "refresh_token" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "account_name" "text",
    "account_email" "text",
    "access_token" "text",
    "expires_at" timestamp with time zone
);


ALTER TABLE "public"."google_integration" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lom_passages" (
    "id" integer NOT NULL,
    "day_of_week" "text" NOT NULL,
    "passage_reference" "text" NOT NULL,
    "week_start_date" "date" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "week_number" integer,
    "user_id" "uuid",
    "is_archived" boolean DEFAULT false NOT NULL,
    "archived_at" timestamp with time zone
);


ALTER TABLE "public"."lom_passages" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."lom_passages_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."lom_passages_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."lom_passages_id_seq" OWNED BY "public"."lom_passages"."id";



CREATE TABLE IF NOT EXISTS "public"."lom_posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "publication_date" "date" DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid",
    "slug" "text",
    "is_archived" boolean DEFAULT false NOT NULL,
    "archived_at" timestamp with time zone
);


ALTER TABLE "public"."lom_posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."news" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "image_url" "text",
    "image_w" integer,
    "image_h" integer,
    "user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "is_archived" boolean DEFAULT false NOT NULL,
    "archived_at" timestamp with time zone,
    "publish_at" timestamp with time zone DEFAULT "now"(),
    "slug" "text"
);


ALTER TABLE "public"."news" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "type" "text" NOT NULL,
    "read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "link" "text"
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."prayer_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "request_text" "text" NOT NULL,
    "is_anonymous" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "is_public" boolean DEFAULT false,
    "name" "text",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "is_archived" boolean DEFAULT false NOT NULL,
    "archived_at" timestamp with time zone
);


ALTER TABLE "public"."prayer_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text",
    "email" "text",
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "is_super_admin" boolean DEFAULT false,
    "perm_events" boolean DEFAULT true,
    "perm_news" boolean DEFAULT true,
    "perm_lom" boolean DEFAULT true,
    "perm_comunidad" boolean DEFAULT false,
    "perm_forms" boolean DEFAULT true,
    "notify_email_prayer" boolean DEFAULT true,
    "notify_dash_prayer" boolean DEFAULT true,
    "notify_email_contact" boolean DEFAULT false,
    "notify_dash_contact" boolean DEFAULT true,
    "perm_internal_forms" boolean DEFAULT false,
    "notify_email_internal" boolean DEFAULT false,
    "notify_dash_internal" boolean DEFAULT false,
    "perm_finanzas" boolean DEFAULT false
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."site_settings" (
    "id" integer DEFAULT 1 NOT NULL,
    "notification_email" "text" DEFAULT 'info@alianzapuembo.org'::"text",
    "maintenance_mode" boolean DEFAULT false,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "announcement_text" "text" DEFAULT ''::"text",
    "announcement_link" "text" DEFAULT ''::"text",
    "announcement_enabled" boolean DEFAULT false,
    CONSTRAINT "one_row_only" CHECK (("id" = 1))
);


ALTER TABLE "public"."site_settings" OWNER TO "postgres";


ALTER TABLE ONLY "public"."lom_passages" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."lom_passages_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."bank_accounts"
    ADD CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bank_reports"
    ADD CONSTRAINT "bank_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bank_transactions"
    ADD CONSTRAINT "bank_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contact_messages"
    ADD CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."form_fields"
    ADD CONSTRAINT "form_fields_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."form_submission_admin_comments"
    ADD CONSTRAINT "form_submission_admin_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."form_submission_payments"
    ADD CONSTRAINT "form_submission_payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."form_submissions"
    ADD CONSTRAINT "form_submissions_access_token_key" UNIQUE ("access_token");



ALTER TABLE ONLY "public"."form_submissions"
    ADD CONSTRAINT "form_submissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."forms"
    ADD CONSTRAINT "forms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."forms"
    ADD CONSTRAINT "forms_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."google_integration"
    ADD CONSTRAINT "google_integration_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lom_passages"
    ADD CONSTRAINT "lom_passages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lom_posts"
    ADD CONSTRAINT "lom_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lom_posts"
    ADD CONSTRAINT "lom_posts_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."news"
    ADD CONSTRAINT "news_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."news"
    ADD CONSTRAINT "news_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."prayer_requests"
    ADD CONSTRAINT "prayer_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."site_settings"
    ADD CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bank_transactions"
    ADD CONSTRAINT "unique_master_transaction" UNIQUE ("date", "amount", "description", "reference");



CREATE UNIQUE INDEX "events_slug_unique" ON "public"."events" USING "btree" ("slug");



CREATE INDEX "idx_bank_accounts_bank_name" ON "public"."bank_accounts" USING "btree" ("bank_name");



CREATE INDEX "idx_bank_accounts_is_active" ON "public"."bank_accounts" USING "btree" ("is_active");



CREATE INDEX "idx_bank_reports_bank_account_id" ON "public"."bank_reports" USING "btree" ("bank_account_id");



CREATE INDEX "idx_bank_transactions_amount" ON "public"."bank_transactions" USING "btree" ("amount");



CREATE INDEX "idx_bank_transactions_date" ON "public"."bank_transactions" USING "btree" ("date");



CREATE INDEX "idx_bank_transactions_report_id" ON "public"."bank_transactions" USING "btree" ("report_id");



CREATE INDEX "idx_contact_messages_created_at" ON "public"."contact_messages" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_events_is_archived" ON "public"."events" USING "btree" ("is_archived");



CREATE INDEX "idx_form_fields_form_id" ON "public"."form_fields" USING "btree" ("form_id");



CREATE INDEX "idx_form_fields_next_section" ON "public"."form_fields" USING "btree" ("next_section_id");



CREATE INDEX "idx_form_submission_admin_comments_created_by" ON "public"."form_submission_admin_comments" USING "btree" ("created_by");



CREATE INDEX "idx_form_submission_admin_comments_submission_id" ON "public"."form_submission_admin_comments" USING "btree" ("submission_id", "created_at");



CREATE INDEX "idx_form_submissions_form_id" ON "public"."form_submissions" USING "btree" ("form_id");



CREATE INDEX "idx_forms_is_archived" ON "public"."forms" USING "btree" ("is_archived");



CREATE INDEX "idx_lom_posts_is_archived" ON "public"."lom_passages" USING "btree" ("is_archived");



CREATE INDEX "idx_news_is_archived" ON "public"."news" USING "btree" ("is_archived");



CREATE INDEX "idx_prayer_requests_is_archived" ON "public"."prayer_requests" USING "btree" ("is_archived");



CREATE OR REPLACE TRIGGER "trg_bank_accounts_updated_at" BEFORE UPDATE ON "public"."bank_accounts" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."bank_reports"
    ADD CONSTRAINT "bank_reports_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "public"."bank_accounts"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."bank_reports"
    ADD CONSTRAINT "bank_reports_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."bank_transactions"
    ADD CONSTRAINT "bank_transactions_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."bank_reports"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."contact_messages"
    ADD CONSTRAINT "contact_messages_replied_by_fkey" FOREIGN KEY ("replied_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "fk_form" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."form_fields"
    ADD CONSTRAINT "form_fields_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."form_submission_admin_comments"
    ADD CONSTRAINT "form_submission_admin_comments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."form_submission_admin_comments"
    ADD CONSTRAINT "form_submission_admin_comments_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "public"."form_submissions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."form_submission_payments"
    ADD CONSTRAINT "form_submission_payments_bank_transaction_id_fkey" FOREIGN KEY ("bank_transaction_id") REFERENCES "public"."bank_transactions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."form_submission_payments"
    ADD CONSTRAINT "form_submission_payments_manual_disposition_by_fkey" FOREIGN KEY ("manual_disposition_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."form_submission_payments"
    ADD CONSTRAINT "form_submission_payments_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "public"."form_submissions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."form_submissions"
    ADD CONSTRAINT "form_submissions_coverage_created_by_fkey" FOREIGN KEY ("coverage_created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."form_submissions"
    ADD CONSTRAINT "form_submissions_covered_by_submission_id_fkey" FOREIGN KEY ("covered_by_submission_id") REFERENCES "public"."form_submissions"("id");



ALTER TABLE ONLY "public"."form_submissions"
    ADD CONSTRAINT "form_submissions_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."form_submissions"
    ADD CONSTRAINT "form_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."forms"
    ADD CONSTRAINT "forms_destination_account_id_fkey" FOREIGN KEY ("destination_account_id") REFERENCES "public"."bank_accounts"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."forms"
    ADD CONSTRAINT "forms_financial_field_id_fkey" FOREIGN KEY ("financial_field_id") REFERENCES "public"."form_fields"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."forms"
    ADD CONSTRAINT "forms_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."lom_passages"
    ADD CONSTRAINT "lom_passages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."lom_posts"
    ADD CONSTRAINT "lom_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."news"
    ADD CONSTRAINT "news_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can delete contact messages" ON "public"."contact_messages" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Admins can delete notifications" ON "public"."notifications" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Admins can update contact messages" ON "public"."contact_messages" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Admins can update notifications" ON "public"."notifications" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Admins can view all notifications" ON "public"."notifications" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Admins can view contact messages" ON "public"."contact_messages" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Admins con permiso pueden gestionar
  reportes" ON "public"."bank_reports" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."perm_finanzas" = true) OR ("profiles"."is_super_admin" = true)))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."perm_finanzas" = true) OR ("profiles"."is_super_admin" = true))))));



CREATE POLICY "Admins con permiso pueden gestionar cuentas
  bancarias" ON "public"."bank_accounts" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."perm_finanzas" = true) OR ("profiles"."is_super_admin" = true)))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_super_admin" = true)))));



CREATE POLICY "Admins con permiso pueden gestionar reportes" ON "public"."bank_reports" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."perm_finanzas" = true) OR ("profiles"."is_super_admin" = true)))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."perm_finanzas" = true) OR ("profiles"."is_super_admin" = true))))));



CREATE POLICY "Admins con permiso pueden gestionar transacciones" ON "public"."bank_transactions" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."perm_finanzas" = true) OR ("profiles"."is_super_admin" = true)))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."perm_finanzas" = true) OR ("profiles"."is_super_admin" = true))))));



CREATE POLICY "Allow admin full access" ON "public"."prayer_requests" TO "authenticated" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow anyone to submit a prayer request" ON "public"."prayer_requests" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow authenticated users to create LOM posts" ON "public"."lom_posts" FOR INSERT WITH CHECK ((("auth"."role"() = 'authenticated'::"text") AND ("user_id" = "auth"."uid"())));



CREATE POLICY "Allow authenticated users to create events" ON "public"."events" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated users to delete events" ON "public"."events" FOR DELETE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated users to update events" ON "public"."events" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow public read access to LOM posts" ON "public"."lom_posts" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to events" ON "public"."events" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to public prayer requests" ON "public"."prayer_requests" FOR SELECT USING (("is_public" = true));



CREATE POLICY "Authenticated delete access" ON "public"."form_submission_payments" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Authenticated delete access" ON "public"."form_submissions" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Authenticated read access" ON "public"."form_submission_payments" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated read access" ON "public"."form_submissions" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated read submission admin comments" ON "public"."form_submission_admin_comments" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."perm_forms" = true) OR ("profiles"."is_super_admin" = true))))));



CREATE POLICY "Authenticated update access" ON "public"."form_submission_payments" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated update access" ON "public"."form_submissions" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated users can manage fields of their own forms" ON "public"."form_fields" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated users can manage their own forms" ON "public"."forms" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated users can read profiles" ON "public"."profiles" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable delete for authenticated users" ON "public"."lom_passages" FOR DELETE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable delete for authenticated users" ON "public"."lom_posts" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Enable insert for authenticated users" ON "public"."lom_passages" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable public read access for lom_passages" ON "public"."lom_passages" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."form_fields" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."forms" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."google_integration" FOR SELECT USING (true);



CREATE POLICY "Enable update for authenticated users" ON "public"."lom_passages" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable update for authenticated users" ON "public"."lom_posts" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Lectura pública de ajustes" ON "public"."site_settings" FOR SELECT USING (true);



CREATE POLICY "Noticias son públicas" ON "public"."news" FOR SELECT USING (true);



CREATE POLICY "Public can insert contact messages" ON "public"."contact_messages" FOR INSERT TO "anon", "authenticated" WITH CHECK (true);



CREATE POLICY "Public insert access" ON "public"."form_submission_payments" FOR INSERT WITH CHECK (true);



CREATE POLICY "Public insert access" ON "public"."form_submissions" FOR INSERT WITH CHECK (true);



CREATE POLICY "Solo Super Admin puede editar ajustes" ON "public"."site_settings" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_super_admin" = true)))));



CREATE POLICY "Super Admin edita site_settings" ON "public"."site_settings" FOR UPDATE TO "authenticated" USING ((( SELECT "profiles"."is_super_admin"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = true));



CREATE POLICY "Super Admin edita todos los perfiles" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ((( SELECT "profiles_1"."is_super_admin"
   FROM "public"."profiles" "profiles_1"
  WHERE ("profiles_1"."id" = "auth"."uid"())) = true));



CREATE POLICY "System can insert notifications" ON "public"."notifications" FOR INSERT TO "anon", "authenticated" WITH CHECK (true);



CREATE POLICY "Usuarios autenticados pueden administrar noticias" ON "public"."news" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Usuarios editan su propio perfil" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



ALTER TABLE "public"."bank_accounts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bank_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bank_transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contact_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."form_fields" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."form_submission_admin_comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."form_submission_payments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."form_submissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."forms" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."google_integration" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."lom_passages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."lom_posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."news" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."prayer_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."site_settings" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_form_financial_summary"("target_form_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_form_financial_summary"("target_form_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_form_financial_summary"("target_form_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_profile_from_auth"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_profile_from_auth"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_profile_from_auth"() TO "service_role";



GRANT ALL ON TABLE "public"."bank_accounts" TO "anon";
GRANT ALL ON TABLE "public"."bank_accounts" TO "authenticated";
GRANT ALL ON TABLE "public"."bank_accounts" TO "service_role";



GRANT ALL ON TABLE "public"."bank_reports" TO "anon";
GRANT ALL ON TABLE "public"."bank_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."bank_reports" TO "service_role";



GRANT ALL ON TABLE "public"."bank_transactions" TO "anon";
GRANT ALL ON TABLE "public"."bank_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."bank_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."contact_messages" TO "anon";
GRANT ALL ON TABLE "public"."contact_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_messages" TO "service_role";



GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";



GRANT ALL ON TABLE "public"."form_fields" TO "anon";
GRANT ALL ON TABLE "public"."form_fields" TO "authenticated";
GRANT ALL ON TABLE "public"."form_fields" TO "service_role";



GRANT ALL ON TABLE "public"."form_submission_admin_comments" TO "anon";
GRANT ALL ON TABLE "public"."form_submission_admin_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."form_submission_admin_comments" TO "service_role";



GRANT ALL ON TABLE "public"."form_submission_payments" TO "anon";
GRANT ALL ON TABLE "public"."form_submission_payments" TO "authenticated";
GRANT ALL ON TABLE "public"."form_submission_payments" TO "service_role";



GRANT ALL ON TABLE "public"."form_submissions" TO "anon";
GRANT ALL ON TABLE "public"."form_submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."form_submissions" TO "service_role";



GRANT ALL ON TABLE "public"."forms" TO "anon";
GRANT ALL ON TABLE "public"."forms" TO "authenticated";
GRANT ALL ON TABLE "public"."forms" TO "service_role";



GRANT ALL ON TABLE "public"."google_integration" TO "anon";
GRANT ALL ON TABLE "public"."google_integration" TO "authenticated";
GRANT ALL ON TABLE "public"."google_integration" TO "service_role";



GRANT ALL ON TABLE "public"."lom_passages" TO "anon";
GRANT ALL ON TABLE "public"."lom_passages" TO "authenticated";
GRANT ALL ON TABLE "public"."lom_passages" TO "service_role";



GRANT ALL ON SEQUENCE "public"."lom_passages_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."lom_passages_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."lom_passages_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."lom_posts" TO "anon";
GRANT ALL ON TABLE "public"."lom_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."lom_posts" TO "service_role";



GRANT ALL ON TABLE "public"."news" TO "anon";
GRANT ALL ON TABLE "public"."news" TO "authenticated";
GRANT ALL ON TABLE "public"."news" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."prayer_requests" TO "anon";
GRANT ALL ON TABLE "public"."prayer_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."prayer_requests" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."site_settings" TO "anon";
GRANT ALL ON TABLE "public"."site_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."site_settings" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







