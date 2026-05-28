const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const CAMPAIGN_ATTACHMENT_ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

export const CAMPAIGN_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;
export const CAMPAIGN_ATTACHMENTS_TOTAL_MAX_BYTES = 20 * 1024 * 1024;

export function canManageFormEmailCampaigns(user, form) {
  if (!user || !form || form.is_internal) return false;
  if (user.is_super_admin) return true;
  return Boolean(user.id && form.user_id && user.id === form.user_id);
}

export function isValidCampaignEmail(email) {
  return EMAIL_RE.test(String(email || "").trim());
}

export function resolveCampaignRecipients({
  submissions = [],
  excludedSubmissionIds = [],
}) {
  const excluded = new Set(excludedSubmissionIds);
  const sendable = [];
  const skipped = [];

  for (const submission of submissions) {
    if (submission?.is_archived || submission?.submission_status === "cancelled") {
      skipped.push({ submission, reason: "archived" });
      continue;
    }

    if (excluded.has(submission?.id)) {
      skipped.push({ submission, reason: "excluded" });
      continue;
    }

    if (!isValidCampaignEmail(submission?.notification_email)) {
      skipped.push({ submission, reason: "invalid_email" });
      continue;
    }

    sendable.push({
      submission,
      email: String(submission.notification_email).trim().toLowerCase(),
    });
  }

  return { sendable, skipped };
}

export function summarizeCampaignDeliveries(events = []) {
  const summary = events.reduce(
    (acc, event) => {
      acc.total += 1;
      if (event.status === "sent") acc.sent += 1;
      if (event.status === "failed") acc.failed += 1;
      if (event.status === "skipped") acc.skipped += 1;
      return acc;
    },
    { total: 0, sent: 0, failed: 0, skipped: 0 },
  );

  let campaignStatus = "sent";
  if (summary.sent === 0 && summary.failed > 0) campaignStatus = "failed";
  else if (summary.failed > 0 || summary.skipped > 0) {
    campaignStatus = "partial";
  }

  return { ...summary, campaignStatus };
}

export function validateCampaignAttachment(file) {
  if (!file) return { ok: false, error: "Archivo inválido." };
  if (file.size > CAMPAIGN_ATTACHMENT_MAX_BYTES) {
    return { ok: false, error: "Cada archivo debe pesar máximo 10MB." };
  }
  if (!CAMPAIGN_ATTACHMENT_ALLOWED_TYPES.has(file.type)) {
    return { ok: false, error: "Tipo de archivo no permitido." };
  }
  return { ok: true };
}

export function validateCampaignAttachmentTotal(files = []) {
  const total = files.reduce(
    (sum, file) => sum + Number(file?.size_bytes ?? file?.size ?? 0),
    0,
  );
  if (total > CAMPAIGN_ATTACHMENTS_TOTAL_MAX_BYTES) {
    return {
      ok: false,
      error: "Los adjuntos de una campaña no pueden superar 20MB en total.",
    };
  }
  return { ok: true };
}

export function getDueScheduledCampaignFilter(nowIso) {
  return {
    status: "scheduled",
    scheduledBeforeOrAt: nowIso,
  };
}
