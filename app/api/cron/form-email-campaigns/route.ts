import { NextResponse } from "next/server";
import { getDueScheduledCampaignFilter } from "@/lib/forms/email-campaigns.mjs";
import { sendCampaignToResolvedRecipients } from "@/lib/services/form-emails";
import { createAdminClient } from "@/lib/supabase/server";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const auth = request.headers.get("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length) : "";
  const headerSecret = request.headers.get("x-cron-secret") || "";

  return bearer === secret || headerSecret === secret;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();
  const filter = getDueScheduledCampaignFilter(nowIso);
  const summary = { scanned: 0, sent: 0, failed: 0 };

  const { data, error } = await supabase
    .from("form_email_campaigns")
    .select("id")
    .eq("status", filter.status)
    .lte("scheduled_at", filter.scheduledBeforeOrAt)
    .order("scheduled_at", { ascending: true })
    .limit(20);

  if (error) {
    return NextResponse.json(
      { error: "Query failed", details: error.message },
      { status: 500 },
    );
  }

  for (const campaign of data || []) {
    summary.scanned += 1;
    const claim = await supabase
      .from("form_email_campaigns")
      .update({ status: "sending" })
      .eq("id", campaign.id)
      .eq("status", "scheduled")
      .select("id")
      .maybeSingle();

    if (claim.error || !claim.data) continue;

    const result = await sendCampaignToResolvedRecipients({
      supabase,
      campaignId: campaign.id,
    });

    if (result?.success) summary.sent += 1;
    else summary.failed += 1;
  }

  return NextResponse.json({ ok: true, ...summary });
}
