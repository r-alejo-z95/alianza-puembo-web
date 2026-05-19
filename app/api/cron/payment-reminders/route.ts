import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getSubmissionBalanceSummary } from "@/lib/finance/submission-balance.mjs";
import {
  isPaymentReminderDue,
  normalizeReminderInterval,
} from "@/lib/finance/payment-reminders.mjs";
import { sendPaymentReminderEmail } from "@/lib/services/notifications";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const auth = request.headers.get("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length) : "";
  const headerSecret = request.headers.get("x-cron-secret") || "";

  return bearer === secret || headerSecret === secret;
}

function singleRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] || null;
  return value || null;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();
  const nowIso = now.toISOString();
  const summary = {
    scanned: 0,
    eligible: 0,
    sent: 0,
    skipped: 0,
    failed: 0,
  };

  const { data, error } = await supabase
    .from("form_submissions")
    .select(`
      id,
      created_at,
      access_token,
      notification_email,
      coverage_mode,
      coverage_amount,
      covered_by_submission_id,
      payment_reminder_last_sent_at,
      submission_status,
      form_submission_payments(id, amount_claimed, extracted_data, status, manual_disposition, created_at),
      forms!inner(id, title, total_amount, is_financial, is_internal, is_archived, payment_reminder_interval_days)
    `)
    .eq("is_archived", false)
    .neq("submission_status", "cancelled")
    .eq("forms.is_financial", true)
    .eq("forms.is_internal", false)
    .eq("forms.is_archived", false)
    .not("forms.payment_reminder_interval_days", "is", null)
    .not("notification_email", "is", null)
    .not("access_token", "is", null);

  if (error) {
    console.error("[payment-reminders] query failed:", error);
    return NextResponse.json(
      { error: "Query failed", details: error.message },
      { status: 500 },
    );
  }

  for (const submission of data || []) {
    summary.scanned += 1;

    const form = singleRelation((submission as any).forms);
    const intervalDays = normalizeReminderInterval(form?.payment_reminder_interval_days);
    if (!form || !intervalDays) {
      summary.skipped += 1;
      continue;
    }

    const balance = getSubmissionBalanceSummary({
      submission,
      totalAmount: Number(form.total_amount || 0),
    });

    if (!balance.isReminderEligible || balance.remainingBalance <= 0) {
      summary.skipped += 1;
      continue;
    }

    if (
      !isPaymentReminderDue({
        now,
        intervalDays,
        submission,
        lastPaymentCreatedAt: balance.lastPaymentCreatedAt,
      })
    ) {
      summary.skipped += 1;
      continue;
    }

    summary.eligible += 1;
    const previousReminderSentAt =
      (submission as any).payment_reminder_last_sent_at || null;
    const emailResult = await sendPaymentReminderEmail(
      (submission as any).notification_email,
      {
        formTitle: form.title || "Inscripción",
        accessToken: (submission as any).access_token,
        totalAmount: balance.totalAmount,
        submittedAmount: balance.submittedAmount,
        remainingBalance: balance.remainingBalance,
        hasPendingVerification: balance.hasPendingVerification,
      },
    );

    if (!emailResult?.success) {
      summary.failed += 1;
      continue;
    }

    let updateQuery = supabase
      .from("form_submissions")
      .update({ payment_reminder_last_sent_at: nowIso })
      .eq("id", (submission as any).id);

    updateQuery = previousReminderSentAt
      ? updateQuery.eq("payment_reminder_last_sent_at", previousReminderSentAt)
      : updateQuery.is("payment_reminder_last_sent_at", null);

    const { error: updateError } = await updateQuery;
    if (updateError) {
      console.error("[payment-reminders] timestamp update failed:", updateError);
      summary.failed += 1;
      continue;
    }

    summary.sent += 1;
  }

  return NextResponse.json({ ok: true, ...summary });
}
