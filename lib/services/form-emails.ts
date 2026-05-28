import { Resend } from "resend";
import {
  buildFormEmailVariables,
  renderFormEmailTemplate,
  wrapFormEmailHtml,
} from "@/lib/forms/email-rendering.mjs";
import {
  resolveCampaignRecipients,
  summarizeCampaignDeliveries,
} from "@/lib/forms/email-campaigns.mjs";
import { getSubmissionBalanceSummary } from "@/lib/finance/submission-balance.mjs";

const resend = new Resend(process.env.RESEND_API_KEY);

type RegistrationFinancialSummary = {
  totalAmount: number;
  amountPaid: number;
  remainingBalance: number;
  hasPendingVerification?: boolean;
  statusLabel?: string;
} | null;

type RegistrationConfirmationPayload = {
  email: string;
  form: {
    title?: string | null;
  };
  submission: {
    access_token?: string | null;
    notification_email?: string | null;
    created_at?: string | null;
    answers?: unknown[] | null;
    data?: Record<string, unknown> | null;
  };
  financialSummary?: RegistrationFinancialSummary;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value || 0);
}

function buildFinancialSummaryBlock(summary: NonNullable<RegistrationFinancialSummary>) {
  return `
    <div style="background-color:#f9f9f9;padding:20px;border-radius:10px;margin:20px 0;">
      <p style="margin:0;font-weight:bold;color:#666;">Resumen de pago</p>
      <p style="margin:8px 0 0 0;"><strong>Total:</strong> ${formatMoney(summary.totalAmount)}</p>
      <p style="margin:4px 0 0 0;"><strong>Pagado:</strong> ${formatMoney(summary.amountPaid)}${summary.hasPendingVerification ? " (por verificar)" : ""}</p>
      <p style="margin:4px 0 0 0;"><strong>Saldo pendiente:</strong> ${formatMoney(summary.remainingBalance)}</p>
    </div>
  `;
}

export async function sendRegistrationConfirmationEmail({
  email,
  form,
  submission,
  financialSummary = null,
}: RegistrationConfirmationPayload) {
  try {
    const variables = buildFormEmailVariables({
      form,
      submission: {
        ...submission,
        notification_email: submission.notification_email || email,
      },
      financialSummary,
    });

    const trackingUrl = variables.link_seguimiento;
    const financialBlock = financialSummary
      ? buildFinancialSummaryBlock(financialSummary)
      : "";
    const followUpCopy = financialSummary?.remainingBalance
      ? "Si necesitas realizar pagos parciales o subir comprobantes adicionales, puedes hacerlo desde tu portal de seguimiento."
      : "Guarda este enlace para consultar cualquier actualización de tu inscripción.";

    const rendered = renderFormEmailTemplate({
      subject: "Registro confirmado: {{formulario}}",
      bodyHtml: `
        <p>Hemos recibido correctamente tu inscripción para <strong>{{formulario}}</strong>.</p>
        ${financialBlock}
        <p>${followUpCopy}</p>
      `,
      variables,
    });

    await resend.emails.send({
      from: "Iglesia Alianza Puembo <notificaciones@alianzapuembo.org>",
      to: [email],
      subject: rendered.subject || "Registro confirmado",
      html: wrapFormEmailHtml({
        title: financialSummary
          ? "Registro y seguimiento de pago"
          : "Registro confirmado",
        bodyHtml: rendered.bodyHtml,
        ctaLabel: trackingUrl ? "Abrir seguimiento" : undefined,
        ctaUrl: trackingUrl || undefined,
      }),
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending registration confirmation email:", error);
    return { success: false, error };
  }
}

function singleRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] || null;
  return value || null;
}

function buildSubmissionFinancialSummary(form: any, submission: any) {
  if (!form?.is_financial) return null;

  const summary = getSubmissionBalanceSummary({
    submission,
    totalAmount: Number(form.total_amount || 0),
  });

  return {
    totalAmount: summary.totalAmount,
    amountPaid: summary.submittedAmount,
    remainingBalance: summary.remainingBalance || 0,
    hasPendingVerification: summary.hasPendingVerification,
    statusLabel: summary.remainingBalance && summary.remainingBalance > 0
      ? "Saldo pendiente"
      : "Registro recibido",
  };
}

async function loadCampaignBundle(supabase: any, campaignId: string) {
  const { data: campaign, error } = await supabase
    .from("form_email_campaigns")
    .select(`
      *,
      forms(*),
      form_email_campaign_attachments(*),
      form_email_campaign_exclusions(*)
    `)
    .eq("id", campaignId)
    .maybeSingle();

  if (error || !campaign) {
    return { error: error?.message || "No se encontró la campaña." };
  }

  const { data: submissions, error: submissionsError } = await supabase
    .from("form_submissions")
    .select("*, form_submission_payments(*)")
    .eq("form_id", campaign.form_id)
    .eq("is_archived", false);

  if (submissionsError) return { error: submissionsError.message };

  return {
    campaign: {
      ...campaign,
      forms: singleRelation(campaign.forms),
    },
    submissions: submissions || [],
  };
}

async function loadResendAttachments(supabase: any, attachments: any[] = []) {
  const loaded = [];

  for (const attachment of attachments) {
    const { data, error } = await supabase.storage
      .from(attachment.bucket)
      .download(attachment.path);
    if (error || !data) continue;

    loaded.push({
      filename: attachment.filename,
      content: Buffer.from(await data.arrayBuffer()),
      contentType: attachment.content_type,
    });
  }

  return loaded;
}

export async function sendCampaignTestEmail({
  email,
  form,
  submission,
  subject,
  bodyHtml,
}: {
  email: string;
  form: any;
  submission: any;
  subject: string;
  bodyHtml: string;
}) {
  const variables = buildFormEmailVariables({
    form,
    submission,
    financialSummary: buildSubmissionFinancialSummary(form, submission),
  });
  const rendered = renderFormEmailTemplate({ subject, bodyHtml, variables });

  const result = await resend.emails.send({
    from: "Iglesia Alianza Puembo <notificaciones@alianzapuembo.org>",
    to: [email],
    subject: `[Prueba] ${rendered.subject}`,
    html: wrapFormEmailHtml({
      title: rendered.subject,
      bodyHtml: rendered.bodyHtml,
      ctaLabel: variables.link_seguimiento ? "Abrir seguimiento" : undefined,
      ctaUrl: variables.link_seguimiento || undefined,
    }),
  });

  if (result?.error) throw new Error(result.error.message);
  return { success: true };
}

export async function sendCampaignToResolvedRecipients({
  supabase,
  campaignId,
  requestedBy = null,
}: {
  supabase: any;
  campaignId: string;
  requestedBy?: string | null;
}) {
  const bundle = await loadCampaignBundle(supabase, campaignId);
  if ("error" in bundle) return { error: bundle.error };

  const { campaign, submissions } = bundle;
  await supabase
    .from("form_email_campaigns")
    .update({ status: "sending", updated_by: requestedBy })
    .eq("id", campaignId);

  const excludedIds = (campaign.form_email_campaign_exclusions || []).map(
    (row: any) => row.submission_id,
  );
  const recipients = resolveCampaignRecipients({
    submissions,
    excludedSubmissionIds: excludedIds,
  });
  const attachments = await loadResendAttachments(
    supabase,
    campaign.form_email_campaign_attachments || [],
  );
  const events: any[] = [];

  for (const skipped of recipients.skipped) {
    events.push({
      campaign_id: campaignId,
      submission_id: skipped.submission?.id || null,
      email: skipped.submission?.notification_email || "sin-correo",
      status: "skipped",
      error_message: skipped.reason,
    });
  }

  for (const recipient of recipients.sendable) {
    try {
      const variables = buildFormEmailVariables({
        form: campaign.forms,
        submission: recipient.submission,
        financialSummary: buildSubmissionFinancialSummary(
          campaign.forms,
          recipient.submission,
        ),
      });
      const rendered = renderFormEmailTemplate({
        subject: campaign.subject,
        bodyHtml: campaign.body_html,
        variables,
      });

      const result = await resend.emails.send({
        from: "Iglesia Alianza Puembo <notificaciones@alianzapuembo.org>",
        to: [recipient.email],
        subject: rendered.subject,
        html: wrapFormEmailHtml({
          title: rendered.subject,
          bodyHtml: rendered.bodyHtml,
          ctaLabel: variables.link_seguimiento ? "Abrir seguimiento" : undefined,
          ctaUrl: variables.link_seguimiento || undefined,
        }),
        attachments,
      });

      if (result?.error) throw new Error(result.error.message);

      events.push({
        campaign_id: campaignId,
        submission_id: recipient.submission.id,
        email: recipient.email,
        status: "sent",
        provider_message_id: result?.data?.id || null,
        sent_at: new Date().toISOString(),
      });
    } catch (error: any) {
      events.push({
        campaign_id: campaignId,
        submission_id: recipient.submission.id,
        email: recipient.email,
        status: "failed",
        error_message: error?.message || "No se pudo enviar el correo.",
      });
    }
  }

  if (events.length > 0) {
    await supabase.from("form_email_delivery_events").insert(events);
  }

  const summary = summarizeCampaignDeliveries(events);
  await supabase
    .from("form_email_campaigns")
    .update({
      status: summary.campaignStatus,
      sent_at: new Date().toISOString(),
      updated_by: requestedBy,
    })
    .eq("id", campaignId);

  return { success: true, summary };
}
