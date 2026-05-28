import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import {
  canManageFormEmailCampaigns,
  getDueScheduledCampaignFilter,
  resolveCampaignRecipients,
  summarizeCampaignDeliveries,
  validateCampaignAttachment,
  validateCampaignAttachmentTotal,
} from "../lib/forms/email-campaigns.mjs";

const migrationUrl = new URL(
  "../supabase/migrations/20260528010000_add_form_email_campaigns.sql",
  import.meta.url,
);
const hardeningMigrationUrl = new URL(
  "../supabase/migrations/20260528011000_harden_form_email_campaigns.sql",
  import.meta.url,
);
const storageMigrationUrl = new URL(
  "../supabase/migrations/20260528012000_add_form_email_attachments_bucket.sql",
  import.meta.url,
);

test("form email campaign migration defines the campaign schema and RLS", () => {
  assert.equal(existsSync(migrationUrl), true);
  const sql = readFileSync(migrationUrl, "utf8");

  for (const tableName of [
    "form_email_templates",
    "form_email_campaigns",
    "form_email_campaign_exclusions",
    "form_email_campaign_attachments",
    "form_email_delivery_events",
  ]) {
    assert.match(
      sql,
      new RegExp(`create table if not exists public\\.${tableName}`),
    );
    assert.match(
      sql,
      new RegExp(`alter table public\\.${tableName} enable row level security`),
    );
    assert.match(
      sql,
      new RegExp(`grant all on table public\\.${tableName} to service_role`),
    );
  }

  assert.match(sql, /form_email_campaigns_status_check/);
  assert.match(sql, /campaign_id, submission_id/);
  assert.match(sql, /form_email_campaigns_status_scheduled_at_idx/);
  assert.match(sql, /form_email_attachments_total_size_check/);
});

test("form email campaign hardening migration addresses advisors", () => {
  assert.equal(existsSync(hardeningMigrationUrl), true);
  const sql = readFileSync(hardeningMigrationUrl, "utf8");

  assert.match(sql, /set search_path = ''/);

  for (const tableName of [
    "form_email_templates",
    "form_email_campaigns",
    "form_email_campaign_exclusions",
    "form_email_campaign_attachments",
    "form_email_delivery_events",
  ]) {
    assert.match(
      sql,
      new RegExp(`revoke all on table public\\.${tableName} from anon`),
    );
    assert.match(
      sql,
      new RegExp(`revoke all on table public\\.${tableName} from authenticated`),
    );
  }

  assert.match(sql, /drop policy if exists "Authenticated read form email campaigns"/);
  assert.match(sql, /form_email_campaigns_template_id_idx/);
  assert.match(sql, /form_email_campaigns_created_by_idx/);
  assert.match(sql, /form_email_campaign_attachments_created_by_idx/);
});

test("form email attachments migration creates a private storage bucket", () => {
  assert.equal(existsSync(storageMigrationUrl), true);
  const sql = readFileSync(storageMigrationUrl, "utf8");

  assert.match(sql, /insert into storage\.buckets/);
  assert.match(sql, /form_email_attachments/);
  assert.match(sql, /public = false/);
  assert.match(sql, /file_size_limit = 10485760/);
  assert.match(sql, /allowed_mime_types/);
});

test("campaign permissions allow only super admins and form creators to manage sends", () => {
  const form = { id: "form-1", user_id: "creator", is_internal: false };

  assert.equal(
    canManageFormEmailCampaigns({ id: "root", is_super_admin: true }, form),
    true,
  );
  assert.equal(
    canManageFormEmailCampaigns({ id: "creator", is_super_admin: false }, form),
    true,
  );
  assert.equal(
    canManageFormEmailCampaigns(
      { id: "delegated", is_super_admin: false },
      {
        ...form,
        form_response_admins: [{ profile_id: "delegated" }],
      },
    ),
    false,
  );
});

test("resolveCampaignRecipients skips invalid emails and respects exclusions", () => {
  const recipients = resolveCampaignRecipients({
    submissions: [
      {
        id: "s1",
        notification_email: "ana@example.com",
        is_archived: false,
        submission_status: "active",
      },
      {
        id: "s2",
        notification_email: "bad-email",
        is_archived: false,
        submission_status: "active",
      },
      {
        id: "s3",
        notification_email: "zoe@example.com",
        is_archived: false,
        submission_status: "active",
      },
      {
        id: "s4",
        notification_email: "archived@example.com",
        is_archived: true,
        submission_status: "active",
      },
    ],
    excludedSubmissionIds: ["s3"],
  });

  assert.deepEqual(
    recipients.sendable.map((item) => item.submission.id),
    ["s1"],
  );
  assert.deepEqual(
    recipients.skipped.map((item) => item.reason),
    ["invalid_email", "excluded", "archived"],
  );
});

test("summarizeCampaignDeliveries maps delivery events into campaign state", () => {
  assert.deepEqual(
    summarizeCampaignDeliveries([
      { status: "sent" },
      { status: "failed" },
      { status: "skipped" },
    ]),
    { total: 3, sent: 1, failed: 1, skipped: 1, campaignStatus: "partial" },
  );
});

test("validateCampaignAttachment enforces supported types and sizes", () => {
  assert.deepEqual(
    validateCampaignAttachment({
      name: "guia.pdf",
      type: "application/pdf",
      size: 1000,
    }),
    { ok: true },
  );
  assert.equal(
    validateCampaignAttachment({
      name: "video.mp4",
      type: "video/mp4",
      size: 1000,
    }).ok,
    false,
  );
  assert.equal(
    validateCampaignAttachment({
      name: "huge.pdf",
      type: "application/pdf",
      size: 11 * 1024 * 1024,
    }).ok,
    false,
  );
});

test("validateCampaignAttachmentTotal counts persisted attachment sizes", () => {
  const result = validateCampaignAttachmentTotal([
    { size_bytes: 12 * 1024 * 1024 },
    { size: 9 * 1024 * 1024 },
  ]);

  assert.equal(result.ok, false);
});

test("getDueScheduledCampaignFilter exposes cron status and cutoff fields", () => {
  assert.deepEqual(
    getDueScheduledCampaignFilter("2026-05-28T12:00:00.000Z"),
    {
      status: "scheduled",
      scheduledBeforeOrAt: "2026-05-28T12:00:00.000Z",
    },
  );
});

test("form email campaign server actions enforce manage permissions and expose primary operations", () => {
  const actionsUrl = new URL(
    "../lib/actions/form-email-campaigns.ts",
    import.meta.url,
  );
  assert.equal(existsSync(actionsUrl), true);
  const source = readFileSync(actionsUrl, "utf8");

  for (const exportName of [
    "saveFormEmailCampaign",
    "saveFormEmailCampaignExclusions",
    "renderFormEmailCampaignPreview",
    "sendFormEmailCampaignTest",
    "sendFormEmailCampaignNow",
    "scheduleFormEmailCampaign",
    "cancelScheduledFormEmailCampaign",
    "uploadFormEmailCampaignAttachment",
    "deleteFormEmailCampaignAttachment",
  ]) {
    assert.match(source, new RegExp(`export async function ${exportName}`));
  }

  assert.match(source, /canManageFormEmailCampaigns/);
  assert.match(source, /getSessionUser/);
  assert.match(source, /form_email_campaigns/);
  assert.match(source, /form_email_campaign_exclusions/);
  assert.match(source, /sendCampaignTestEmail/);
});

test("form data layer fetches campaigns with delivery events and attachments", () => {
  const formsData = readFileSync(
    new URL("../lib/data/forms.ts", import.meta.url),
    "utf8",
  );

  assert.match(formsData, /getFormEmailCampaigns/);
  assert.match(formsData, /form_email_campaign_attachments/);
  assert.match(formsData, /form_email_delivery_events/);
});

test("form email campaign delivery service and cron route are wired", () => {
  const service = readFileSync(
    new URL("../lib/services/form-emails.ts", import.meta.url),
    "utf8",
  );
  const routeUrl = new URL(
    "../app/api/cron/form-email-campaigns/route.ts",
    import.meta.url,
  );
  assert.equal(existsSync(routeUrl), true);
  const route = readFileSync(routeUrl, "utf8");

  assert.match(service, /export async function sendCampaignToResolvedRecipients/);
  assert.match(service, /resolveCampaignRecipients/);
  assert.match(service, /form_email_delivery_events/);
  assert.match(service, /attachments/);
  assert.match(route, /CRON_SECRET/);
  assert.match(route, /getDueScheduledCampaignFilter/);
  assert.match(route, /sendCampaignToResolvedRecipients/);
});

test("campaign emails only add automatic tracking CTA for financial forms", () => {
  const service = readFileSync(
    new URL("../lib/services/form-emails.ts", import.meta.url),
    "utf8",
  );

  assert.match(service, /function shouldIncludeTrackingLink/);
  assert.match(service, /form\?\.is_financial/);
  assert.doesNotMatch(
    service,
    /ctaLabel:\s*variables\.link_seguimiento\s*\?\s*"Abrir seguimiento"/,
  );
});

test("campaign preview action returns the wrapped email html", () => {
  const actions = readFileSync(
    new URL("../lib/actions/form-email-campaigns.ts", import.meta.url),
    "utf8",
  );

  assert.match(actions, /renderCampaignEmailPreview/);
  assert.doesNotMatch(actions, /preview:\s*renderFormEmailTemplate/);
});

test("campaign preview and test email load payment details for financial variables", () => {
  const actions = readFileSync(
    new URL("../lib/actions/form-email-campaigns.ts", import.meta.url),
    "utf8",
  );
  const paymentSelects = actions.match(/\.select\("\*, form_submission_payments\(\*\)"\)/g) || [];

  assert.ok(paymentSelects.length >= 2);
});

test("scheduled form email campaigns are configured for external cron", () => {
  const config = JSON.parse(
    readFileSync(new URL("../vercel.json", import.meta.url), "utf8"),
  );
  assert.equal(
    config.crons.some((cron) => cron.path === "/api/cron/form-email-campaigns"),
    false,
  );

  const docsUrl = new URL("../docs/cron-job-org.md", import.meta.url);
  assert.equal(existsSync(docsUrl), true);
  const docs = readFileSync(docsUrl, "utf8");

  assert.match(docs, /cron-job\.org/);
  assert.match(docs, /\/api\/cron\/form-email-campaigns/);
  assert.match(docs, /Authorization:\s*Bearer <CRON_SECRET>/);
});
