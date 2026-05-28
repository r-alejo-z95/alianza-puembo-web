"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/getSessionUser";
import { createAdminClient } from "@/lib/supabase/server";
import {
  canManageFormEmailCampaigns,
  validateCampaignAttachment,
  validateCampaignAttachmentTotal,
} from "@/lib/forms/email-campaigns.mjs";
import {
  buildFormEmailVariables,
  renderFormEmailTemplate,
} from "@/lib/forms/email-rendering.mjs";
import {
  sendCampaignTestEmail,
  sendCampaignToResolvedRecipients,
} from "@/lib/services/form-emails";

async function getCampaignFormContext(formId: string) {
  const user = await getSessionUser();
  if (!user) return { error: "Sesión expirada. Vuelve a iniciar sesión." };

  const supabase = createAdminClient();
  const { data: form, error } = await supabase
    .from("forms")
    .select("*, form_response_admins(profile_id)")
    .eq("id", formId)
    .maybeSingle();

  if (error || !form || form.is_archived || form.is_internal) {
    return { error: "Formulario no disponible." };
  }

  return {
    supabase,
    user,
    form,
    canManage: canManageFormEmailCampaigns(user, form),
  };
}

async function getCampaignForForm(supabase: any, formId: string, campaignId: string) {
  const { data, error } = await supabase
    .from("form_email_campaigns")
    .select("*")
    .eq("id", campaignId)
    .eq("form_id", formId)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

function revalidateAnalytics(form: { slug?: string | null }) {
  if (form.slug) {
    revalidatePath(`/admin/formularios/analiticas/${form.slug}`);
  }
}

export async function saveFormEmailCampaign(input: {
  formId: string;
  campaignId?: string | null;
  name: string;
  subject: string;
  bodyHtml: string;
  bodyJson?: unknown;
}) {
  const context = await getCampaignFormContext(input.formId);
  if ("error" in context) return { error: context.error };
  if (!context.canManage) {
    return { error: "No tienes permisos para editar correos de este formulario." };
  }

  const payload = {
    form_id: input.formId,
    name: String(input.name || "").trim(),
    subject: String(input.subject || "").trim(),
    body_html: String(input.bodyHtml || "").trim(),
    body_json: input.bodyJson ?? null,
    updated_by: context.user.id,
  };

  if (!payload.name || !payload.subject || !payload.body_html) {
    return { error: "Nombre, asunto y contenido son obligatorios." };
  }

  if (input.campaignId) {
    const existing = await getCampaignForForm(
      context.supabase,
      input.formId,
      input.campaignId,
    );
    if (!existing) return { error: "No se encontró la campaña." };
  }

  const query = input.campaignId
    ? context.supabase
        .from("form_email_campaigns")
        .update(payload)
        .eq("id", input.campaignId)
        .eq("form_id", input.formId)
        .select("*")
        .single()
    : context.supabase
        .from("form_email_campaigns")
        .insert([{ ...payload, created_by: context.user.id }])
        .select("*")
        .single();

  const { data, error } = await query;
  if (error) return { error: error.message };

  revalidateAnalytics(context.form);
  return { success: true, campaign: data };
}

export async function saveFormEmailCampaignExclusions(input: {
  formId: string;
  campaignId: string;
  excludedSubmissionIds: string[];
}) {
  const context = await getCampaignFormContext(input.formId);
  if ("error" in context) return { error: context.error };
  if (!context.canManage) return { error: "No tienes permisos para editar destinatarios." };

  const campaign = await getCampaignForForm(
    context.supabase,
    input.formId,
    input.campaignId,
  );
  if (!campaign) return { error: "No se encontró la campaña." };

  await context.supabase
    .from("form_email_campaign_exclusions")
    .delete()
    .eq("campaign_id", input.campaignId);

  const uniqueIds = [...new Set(input.excludedSubmissionIds || [])];
  const rows = uniqueIds.map((submissionId) => ({
    campaign_id: input.campaignId,
    submission_id: submissionId,
    created_by: context.user.id,
  }));

  if (rows.length > 0) {
    const { error } = await context.supabase
      .from("form_email_campaign_exclusions")
      .insert(rows);
    if (error) return { error: error.message };
  }

  revalidateAnalytics(context.form);
  return { success: true };
}

export async function renderFormEmailCampaignPreview(input: {
  formId: string;
  campaignId?: string | null;
  subject: string;
  bodyHtml: string;
  submissionId?: string | null;
}) {
  const context = await getCampaignFormContext(input.formId);
  if ("error" in context) return { error: context.error };

  let query = context.supabase
    .from("form_submissions")
    .select("*")
    .eq("form_id", input.formId)
    .eq("is_archived", false);

  query = input.submissionId
    ? query.eq("id", input.submissionId).limit(1)
    : query.order("created_at", { ascending: false }).limit(1);

  const { data: submission } = await query.maybeSingle();
  const variables = buildFormEmailVariables({
    form: context.form,
    submission: submission || {},
  });

  return {
    success: true,
    preview: renderFormEmailTemplate({
      subject: input.subject,
      bodyHtml: input.bodyHtml,
      variables,
    }),
  };
}

export async function sendFormEmailCampaignTest(input: {
  formId: string;
  email: string;
  subject: string;
  bodyHtml: string;
  submissionId?: string | null;
}) {
  const context = await getCampaignFormContext(input.formId);
  if ("error" in context) return { error: context.error };
  if (!context.canManage) return { error: "No tienes permisos para enviar pruebas." };

  let query = context.supabase
    .from("form_submissions")
    .select("*")
    .eq("form_id", input.formId)
    .eq("is_archived", false);

  query = input.submissionId
    ? query.eq("id", input.submissionId).limit(1)
    : query.order("created_at", { ascending: false }).limit(1);

  const { data: submission } = await query.maybeSingle();
  try {
    return await sendCampaignTestEmail({
      email: input.email,
      form: context.form,
      submission: submission || {},
      subject: input.subject,
      bodyHtml: input.bodyHtml,
    });
  } catch (error: any) {
    return { error: error?.message || "No se pudo enviar el correo de prueba." };
  }
}

export async function sendFormEmailCampaignNow(input: {
  formId: string;
  campaignId: string;
}) {
  const context = await getCampaignFormContext(input.formId);
  if ("error" in context) return { error: context.error };
  if (!context.canManage) {
    return { error: "No tienes permisos para enviar correos de este formulario." };
  }

  const campaign = await getCampaignForForm(
    context.supabase,
    input.formId,
    input.campaignId,
  );
  if (!campaign) return { error: "No se encontró la campaña." };

  const result = await sendCampaignToResolvedRecipients({
    supabase: context.supabase,
    campaignId: input.campaignId,
    requestedBy: context.user.id,
  });

  revalidateAnalytics(context.form);
  return result;
}

export async function scheduleFormEmailCampaign(input: {
  formId: string;
  campaignId: string;
  scheduledAt: string;
}) {
  const context = await getCampaignFormContext(input.formId);
  if ("error" in context) return { error: context.error };
  if (!context.canManage) {
    return { error: "No tienes permisos para programar correos de este formulario." };
  }

  const scheduledAt = new Date(input.scheduledAt);
  if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() <= Date.now()) {
    return { error: "Escoge una fecha futura para programar el correo." };
  }

  const { error } = await context.supabase
    .from("form_email_campaigns")
    .update({
      status: "scheduled",
      scheduled_at: scheduledAt.toISOString(),
      updated_by: context.user.id,
    })
    .eq("id", input.campaignId)
    .eq("form_id", input.formId);

  if (error) return { error: error.message };

  revalidateAnalytics(context.form);
  return { success: true };
}

export async function cancelScheduledFormEmailCampaign(input: {
  formId: string;
  campaignId: string;
}) {
  const context = await getCampaignFormContext(input.formId);
  if ("error" in context) return { error: context.error };
  if (!context.canManage) return { error: "No tienes permisos para cancelar este correo." };

  const { error } = await context.supabase
    .from("form_email_campaigns")
    .update({ status: "cancelled", updated_by: context.user.id })
    .eq("id", input.campaignId)
    .eq("form_id", input.formId)
    .eq("status", "scheduled");

  if (error) return { error: error.message };

  revalidateAnalytics(context.form);
  return { success: true };
}

export async function uploadFormEmailCampaignAttachment(formData: FormData) {
  const formId = String(formData.get("formId") || "");
  const campaignId = String(formData.get("campaignId") || "");
  const file = formData.get("file");

  const context = await getCampaignFormContext(formId);
  if ("error" in context) return { error: context.error };
  if (!context.canManage) return { error: "No tienes permisos para subir adjuntos." };
  if (!(file instanceof File)) return { error: "Archivo inválido." };

  const campaign = await getCampaignForForm(context.supabase, formId, campaignId);
  if (!campaign) return { error: "No se encontró la campaña." };

  const validation = validateCampaignAttachment(file);
  if (!validation.ok) return { error: validation.error };

  const { data: existing } = await context.supabase
    .from("form_email_campaign_attachments")
    .select("size_bytes")
    .eq("campaign_id", campaignId);

  const totalValidation = validateCampaignAttachmentTotal([
    ...(existing || []),
    file,
  ]);
  if (!totalValidation.ok) return { error: totalValidation.error };

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const storagePath = `${formId}/${campaignId}/${Date.now()}-${safeName}`;
  const { error: uploadError } = await context.supabase.storage
    .from("form_email_attachments")
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (uploadError) return { error: uploadError.message };

  const { data, error } = await context.supabase
    .from("form_email_campaign_attachments")
    .insert({
      campaign_id: campaignId,
      bucket: "form_email_attachments",
      path: storagePath,
      filename: file.name,
      content_type: file.type,
      size_bytes: file.size,
      created_by: context.user.id,
    })
    .select("*")
    .single();

  if (error) return { error: error.message };

  revalidateAnalytics(context.form);
  return { success: true, attachment: data };
}

export async function deleteFormEmailCampaignAttachment(input: {
  formId: string;
  attachmentId: string;
}) {
  const context = await getCampaignFormContext(input.formId);
  if ("error" in context) return { error: context.error };
  if (!context.canManage) return { error: "No tienes permisos para eliminar adjuntos." };

  const { data: attachment, error: lookupError } = await context.supabase
    .from("form_email_campaign_attachments")
    .select("*")
    .eq("id", input.attachmentId)
    .maybeSingle();

  if (lookupError || !attachment?.campaign_id) {
    return { error: "No se encontró el adjunto." };
  }

  const campaign = await getCampaignForForm(
    context.supabase,
    input.formId,
    attachment.campaign_id,
  );
  if (!campaign) return { error: "No se encontró el adjunto." };

  await context.supabase.storage
    .from(attachment.bucket)
    .remove([attachment.path]);

  const { error } = await context.supabase
    .from("form_email_campaign_attachments")
    .delete()
    .eq("id", input.attachmentId);

  if (error) return { error: error.message };

  revalidateAnalytics(context.form);
  return { success: true };
}
