"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/getSessionUser";
import { slugify } from "@/lib/utils";
import { revalidateFormSubmissions, revalidateForms } from "@/lib/actions/cache";
import { ensureFinanceReceiptsBucket } from "@/lib/finance/storage";
import {
  buildSubmissionResponseUpdate,
  canManageSubmissionResponses,
} from "@/lib/forms/submission-admin.mjs";
import { collectStoragePathsFromSubmission } from "@/lib/finance/submission-lifecycle.mjs";
import {
  findAvailableFormShortCode,
  isReservedFormShortCode,
  isValidFormShortCode,
  normalizeFormShortCode,
} from "@/lib/forms/short-links.mjs";
import {
  normalizeParticipantTemplate,
  normalizePricingMode,
  normalizePricingPackages,
  validatePricingConfiguration,
} from "@/lib/finance/pricing-packages.mjs";

interface FormSetupValues {
  id?: string | null;
  title: string;
  is_internal: boolean;
  is_publicly_listed?: boolean;
  max_responses: number;
  is_financial: boolean;
  payment_type?: "single" | "installments" | null;
  max_installments?: number | null;
  total_amount?: number | null;
  pricing_mode?: "fixed" | "packages" | null;
  pricing_packages?: any[] | null;
  collect_participant_details?: boolean | null;
  participant_template?: any[] | null;
  allow_shared_receipts?: boolean;
  shared_receipt_max_submissions?: number | null;
  destination_account_id?: string | null;
  payment_reminder_interval_days?: number | null;
  description?: string | null;
}

export async function saveFormSetup(
  values: FormSetupValues,
): Promise<{ formId?: string; error?: string }> {
  try {
    const user = await getSessionUser();
    if (!user) return { error: "Sesión expirada. Vuelve a iniciar sesión." };
    const canManageForms = user.is_super_admin || user.permissions?.perm_forms || user.permissions?.perm_internal_forms;
    if (!canManageForms) {
      return { error: "No tienes permisos para crear o editar formularios." };
    }

    const supabase = createAdminClient();
    const isEditing = !!values.id;
    const pricingMode = values.is_financial
      ? normalizePricingMode(values.pricing_mode)
      : "fixed";
    const pricingPackages = pricingMode === "packages"
      ? normalizePricingPackages(values.pricing_packages)
      : [];
    const participantTemplate = pricingMode === "packages" && values.collect_participant_details
      ? normalizeParticipantTemplate(values.participant_template)
      : [];
    const pricingValidation = values.is_financial
      ? validatePricingConfiguration({
          pricing_mode: pricingMode,
          total_amount: values.total_amount,
          pricing_packages: pricingPackages,
          collect_participant_details: !!values.collect_participant_details,
          participant_template: participantTemplate,
        })
      : { valid: true, errors: [] };

    if (!pricingValidation.valid) {
      return { error: pricingValidation.errors.join(" ") };
    }

    const payload: Record<string, any> = {
      title: values.title.trim(),
      is_internal: values.is_internal,
      is_publicly_listed: values.is_internal ? false : !!values.is_publicly_listed,
      max_responses: values.max_responses,
      is_financial: values.is_financial,
      payment_type: values.is_financial ? (values.payment_type ?? "single") : null,
      max_installments:
        values.is_financial && values.payment_type === "installments"
          ? (values.max_installments ?? null)
          : null,
      total_amount:
        values.is_financial && pricingMode === "fixed"
          ? (values.total_amount ?? null)
          : null,
      pricing_mode: values.is_financial ? pricingMode : "fixed",
      pricing_packages: values.is_financial && pricingMode === "packages" ? pricingPackages : [],
      collect_participant_details:
        values.is_financial && pricingMode === "packages"
          ? !!values.collect_participant_details
          : false,
      participant_template:
        values.is_financial && pricingMode === "packages" ? participantTemplate : [],
      allow_shared_receipts: values.is_financial ? !!values.allow_shared_receipts : false,
      shared_receipt_max_submissions:
        values.is_financial && values.allow_shared_receipts
          ? Math.max(Number(values.shared_receipt_max_submissions ?? 1), 1)
          : 1,
      destination_account_id: values.is_financial
        ? (values.destination_account_id ?? null)
        : null,
      payment_reminder_interval_days: values.is_financial
        ? (values.payment_reminder_interval_days ?? null)
        : null,
      description: values.description ?? null,
    };

    if (values.is_financial) {
      const bucketResult = await ensureFinanceReceiptsBucket();
      if (bucketResult?.error) {
        return { error: `No se pudo preparar el bucket de comprobantes: ${bucketResult.error}` };
      }
    }

    if (isEditing) {
      // Never change slug on edit — it's part of the public URL
      const { error } = await supabase
        .from("forms")
        .update(payload)
        .eq("id", values.id);
      if (error) throw error;
      await revalidateForms();
      return { formId: values.id! };
    } else {
      payload.short_code = await findAvailableFormShortCode(supabase, values.title);
      payload.slug = slugify(values.title);
      payload.user_id = user.id;

      const { data, error } = await supabase
        .from("forms")
        .insert([payload])
        .select("id")
        .single();
      if (error) throw error;
      await revalidateForms();
      return { formId: data.id };
    }
  } catch (e: any) {
    console.error("[saveFormSetup]", e);
    return { error: e.message ?? "No se pudo guardar la configuración." };
  }
}

export async function prepareFinancialReceiptsBucket(): Promise<{ success?: true; error?: string }> {
  const user = await getSessionUser();
  if (!user) return { error: "Sesión expirada. Vuelve a iniciar sesión." };

  const canManageForms = user.is_super_admin || user.permissions?.perm_forms || user.permissions?.perm_internal_forms;
  if (!canManageForms) {
    return { error: "No tienes permisos para preparar almacenamiento de formularios." };
  }

  const bucketResult = await ensureFinanceReceiptsBucket();
  if (bucketResult?.error) {
    return { error: bucketResult.error };
  }

  return { success: true };
}

export async function updateFormShortCode(
  formId: string,
  shortCode: string,
): Promise<{ shortCode?: string; error?: string }> {
  try {
    const user = await getSessionUser();
    if (!user) return { error: "Sesión expirada. Vuelve a iniciar sesión." };

    const normalizedShortCode = normalizeFormShortCode(shortCode);
    if (!isValidFormShortCode(normalizedShortCode)) {
      return {
        error: "El link corto debe tener entre 3 y 40 caracteres: letras minúsculas, números y guiones.",
      };
    }

    if (isReservedFormShortCode(normalizedShortCode)) {
      return { error: "Ese link corto está reservado por otra sección del sitio." };
    }

    const supabase = createAdminClient();
    const { data: form, error: formError } = await supabase
      .from("forms")
      .select("id, is_internal, is_archived")
      .eq("id", formId)
      .maybeSingle();

    if (formError || !form || form.is_archived) {
      return { error: "No se encontró el formulario." };
    }

    const canEdit = user.is_super_admin
      || (form.is_internal ? user.permissions?.perm_internal_forms : user.permissions?.perm_forms);

    if (!canEdit) {
      return { error: "No tienes permisos para editar este formulario." };
    }

    const { data: existing, error: existingError } = await supabase
      .from("forms")
      .select("id")
      .eq("short_code", normalizedShortCode)
      .neq("id", formId)
      .maybeSingle();

    if (existingError) throw existingError;
    if (existing) {
      return { error: "Ese link corto ya está en uso por otro formulario." };
    }

    const { error: updateError } = await supabase
      .from("forms")
      .update({ short_code: normalizedShortCode })
      .eq("id", formId);

    if (updateError?.code === "23505") {
      return { error: "Ese link corto ya está en uso por otro formulario." };
    }
    if (updateError) throw updateError;

    await revalidateForms();
    return { shortCode: normalizedShortCode };
  } catch (e: any) {
    console.error("[updateFormShortCode]", e);
    return { error: e.message ?? "No se pudo actualizar el link corto." };
  }
}

async function attachManageableFormResponseAdmins(supabase: any, form: any) {
  if (!form?.id) return form;

  const { data, error } = await supabase
    .from("form_response_admins")
    .select("profile_id")
    .eq("form_id", form.id);

  if (error) {
    console.error("[attachManageableFormResponseAdmins] lookup failed:", error);
    return { ...form, form_response_admins: [] };
  }

  return { ...form, form_response_admins: data ?? [] };
}

async function getManageableSubmission(submissionId: string) {
  const user = await getSessionUser();
  if (!user) return { error: "Sesión expirada. Vuelve a iniciar sesión." };

  const supabase = createAdminClient();
  const { data: submission, error: submissionError } = await supabase
    .from("form_submissions")
    .select("id, form_id, data, answers, is_archived, coverage_backup_path, form_submission_payments(receipt_path)")
    .eq("id", submissionId)
    .maybeSingle();

  if (submissionError) {
    console.error("[getManageableSubmission] submission lookup failed:", submissionError);
    return { error: "No se encontró la respuesta." };
  }

  if (!submission) {
    return { error: "No se encontró la respuesta." };
  }

  const { data: form, error: formError } = await supabase
    .from("forms")
    .select("id, user_id, is_internal, is_archived, form_fields!form_id(*)")
    .eq("id", (submission as any).form_id)
    .maybeSingle();

  if (formError) {
    console.error("[getManageableSubmission] form lookup failed:", formError);
    return { error: "No se pudo cargar el formulario de la respuesta." };
  }

  if (!form || form.is_archived) {
    return { error: "El formulario ya no está disponible." };
  }

  if (form.is_internal) {
    return { error: "Esta acción solo aplica a formularios públicos." };
  }

  const formWithAdmins = await attachManageableFormResponseAdmins(supabase, form);

  if (!canManageSubmissionResponses(user, formWithAdmins)) {
    return { error: "No tienes permisos para modificar respuestas de este formulario." };
  }

  return { supabase, submission, form: formWithAdmins, user };
}

async function getManageableForm(formId: string) {
  const user = await getSessionUser();
  if (!user) return { error: "Sesión expirada. Vuelve a iniciar sesión." };

  const supabase = createAdminClient();
  const { data: form, error: formError } = await supabase
    .from("forms")
    .select("id, user_id, is_internal, is_archived, form_fields!form_id(*)")
    .eq("id", formId)
    .maybeSingle();

  if (formError) {
    console.error("[getManageableForm] form lookup failed:", formError);
    return { error: "No se pudo cargar el formulario." };
  }

  if (!form || form.is_archived) {
    return { error: "El formulario ya no está disponible." };
  }

  if (form.is_internal) {
    return { error: "Esta acción solo aplica a formularios públicos." };
  }

  const formWithAdmins = await attachManageableFormResponseAdmins(supabase, form);

  if (!canManageSubmissionResponses(user, formWithAdmins)) {
    return { error: "No tienes permisos para modificar respuestas de este formulario." };
  }

  return { supabase, form: formWithAdmins, user };
}

async function getSubmissionWithRelations(supabase: any, submissionId: string) {
  const { data, error } = await supabase
    .from("form_submissions")
    .select("*, profiles:profiles!form_submissions_user_id_fkey(*), form_submission_payments(*), form_submission_admin_comments(*, profiles:profiles!form_submission_admin_comments_created_by_fkey(full_name, email))")
    .eq("id", submissionId)
    .maybeSingle();

  if (error) {
    console.error("[getSubmissionWithRelations] lookup failed:", error);
    return null;
  }

  if (!data) return null;

  return {
    ...data,
    form_submission_admin_comments: [
      ...(data.form_submission_admin_comments ?? []),
    ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
  };
}

async function getSubmissionAdminCommentWithProfile(supabase: any, commentId: string) {
  const { data, error } = await supabase
    .from("form_submission_admin_comments")
    .select("*, profiles:profiles!form_submission_admin_comments_created_by_fkey(full_name, email)")
    .eq("id", commentId)
    .maybeSingle();

  if (error) {
    console.error("[getSubmissionAdminCommentWithProfile] lookup failed:", error);
    return null;
  }

  return data;
}

async function cleanupDeletedSubmissionStorage(
  supabase: any,
  storagePathsByBucket: Record<string, string[]>,
) {
  const financeReceiptPaths = storagePathsByBucket.finance_receipts ?? [];
  if (financeReceiptPaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("finance_receipts")
      .remove(financeReceiptPaths);

    if (storageError) {
      console.error("[permanentlyDeleteFormSubmissionResponse] finance receipt cleanup failed:", storageError);
    }
  }

  const formUploadPaths = storagePathsByBucket.form_uploads ?? [];
  if (formUploadPaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("form_uploads")
      .remove(formUploadPaths);

    if (storageError) {
      console.error("[permanentlyDeleteFormSubmissionResponse] form upload cleanup failed:", storageError);
    }
  }
}

export async function updateFormSubmissionResponse({
  submissionId,
  values,
}: {
  submissionId: string;
  values: Record<string, any>;
}): Promise<{ success?: true; submission?: { id: string; data: any; answers: any[] }; error?: string }> {
  try {
    if (!submissionId) return { error: "Respuesta inválida." };

    const context = await getManageableSubmission(submissionId);
    if ("error" in context) return { error: context.error };

    const { supabase, submission, form } = context;
    if ((submission as any).is_archived) {
      return { error: "No puedes editar una respuesta archivada." };
    }

    const update = buildSubmissionResponseUpdate({
      form,
      submission,
      values: values ?? {},
    });

    const { error } = await supabase
      .from("form_submissions")
      .update({ data: update.data, answers: update.answers })
      .eq("id", submissionId)
      .eq("form_id", (submission as any).form_id);

    if (error) throw error;

    await revalidateFormSubmissions((submission as any).form_id);

    return {
      success: true,
      submission: {
        id: submissionId,
        data: update.data,
        answers: update.answers,
      },
    };
  } catch (e: any) {
    console.error("[updateFormSubmissionResponse]", e);
    return { error: e.message ?? "No se pudo actualizar la respuesta." };
  }
}

export async function archiveFormSubmissionResponse(
  submissionId: string,
): Promise<{ success?: true; error?: string }> {
  try {
    if (!submissionId) return { error: "Respuesta inválida." };

    const context = await getManageableSubmission(submissionId);
    if ("error" in context) return { error: context.error };

    const { supabase, submission } = context;
    const archivedAt = new Date().toISOString();

    const { error } = await supabase
      .from("form_submissions")
      .update({ is_archived: true, archived_at: archivedAt })
      .eq("id", submissionId)
      .eq("form_id", (submission as any).form_id);

    if (error) throw error;

    await revalidateFormSubmissions((submission as any).form_id);

    return { success: true };
  } catch (e: any) {
    console.error("[archiveFormSubmissionResponse]", e);
    return { error: e.message ?? "No se pudo eliminar la respuesta." };
  }
}

export async function getArchivedFormSubmissionResponses(
  formId: string,
): Promise<{ submissions?: any[]; error?: string }> {
  try {
    if (!formId) return { error: "Formulario inválido." };

    const context = await getManageableForm(formId);
    if ("error" in context) return { error: context.error };

    const { supabase } = context;
    const { data, error } = await supabase
      .from("form_submissions")
      .select("*, profiles:profiles!form_submissions_user_id_fkey(*), form_submission_payments(*), form_submission_admin_comments(*, profiles:profiles!form_submission_admin_comments_created_by_fkey(full_name, email))")
      .eq("form_id", formId)
      .eq("is_archived", true)
      .order("archived_at", { ascending: false });

    if (error) throw error;

    return {
      submissions: (data ?? []).map((submission: any) => ({
        ...submission,
        form_submission_admin_comments: [
          ...(submission.form_submission_admin_comments ?? []),
        ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
      })),
    };
  } catch (e: any) {
    console.error("[getArchivedFormSubmissionResponses]", e);
    return { error: e.message ?? "No se pudo cargar la papelera." };
  }
}

export async function restoreArchivedFormSubmissionResponse(
  submissionId: string,
): Promise<{ success?: true; submission?: any; error?: string }> {
  try {
    if (!submissionId) return { error: "Respuesta inválida." };

    const context = await getManageableSubmission(submissionId);
    if ("error" in context) return { error: context.error };

    const { supabase, submission } = context;
    const { error } = await supabase
      .from("form_submissions")
      .update({ is_archived: false, archived_at: null })
      .eq("id", submissionId)
      .eq("form_id", (submission as any).form_id);

    if (error) throw error;

    await revalidateFormSubmissions((submission as any).form_id);

    return {
      success: true,
      submission: await getSubmissionWithRelations(supabase, submissionId),
    };
  } catch (e: any) {
    console.error("[restoreArchivedFormSubmissionResponse]", e);
    return { error: e.message ?? "No se pudo restaurar la respuesta." };
  }
}

export async function permanentlyDeleteFormSubmissionResponse(
  submissionId: string,
): Promise<{ success?: true; error?: string }> {
  try {
    if (!submissionId) return { error: "Respuesta inválida." };

    const context = await getManageableSubmission(submissionId);
    if ("error" in context) return { error: context.error };

    const { supabase, submission } = context;
    if (!(submission as any).is_archived) {
      return { error: "Solo puedes eliminar definitivamente respuestas archivadas." };
    }

    const storagePathsByBucket = collectStoragePathsFromSubmission(submission);

    const { error } = await supabase
      .from("form_submissions")
      .delete()
      .eq("id", submissionId)
      .eq("form_id", (submission as any).form_id);

    if (error) throw error;

    await cleanupDeletedSubmissionStorage(supabase, storagePathsByBucket);

    await revalidateFormSubmissions((submission as any).form_id);

    return { success: true };
  } catch (e: any) {
    console.error("[permanentlyDeleteFormSubmissionResponse]", e);
    return { error: e.message ?? "No se pudo eliminar definitivamente la respuesta." };
  }
}

export async function createFormSubmissionAdminComment({
  submissionId,
  body,
}: {
  submissionId: string;
  body: string;
}): Promise<{ success?: true; comment?: any; error?: string }> {
  try {
    if (!submissionId) return { error: "Respuesta inválida." };
    const trimmedBody = String(body ?? "").trim();
    if (!trimmedBody) return { error: "La observación no puede estar vacía." };

    const context = await getManageableSubmission(submissionId);
    if ("error" in context) return { error: context.error };

    const { supabase, submission, user } = context;
    if ((submission as any).is_archived) {
      return { error: "No puedes comentar una respuesta archivada." };
    }

    const { data, error } = await supabase
      .from("form_submission_admin_comments")
      .insert({
        submission_id: submissionId,
        body: trimmedBody,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (error) throw error;

    await revalidateFormSubmissions((submission as any).form_id);

    return {
      success: true,
      comment: await getSubmissionAdminCommentWithProfile(supabase, data.id),
    };
  } catch (e: any) {
    console.error("[createFormSubmissionAdminComment]", e);
    return { error: e.message ?? "No se pudo guardar la observación." };
  }
}

export async function updateFormSubmissionAdminComment({
  submissionId,
  commentId,
  body,
}: {
  submissionId: string;
  commentId: string;
  body: string;
}): Promise<{ success?: true; comment?: any; error?: string }> {
  try {
    if (!submissionId || !commentId) return { error: "Observación inválida." };
    const trimmedBody = String(body ?? "").trim();
    if (!trimmedBody) return { error: "La observación no puede estar vacía." };

    const context = await getManageableSubmission(submissionId);
    if ("error" in context) return { error: context.error };

    const { supabase, submission } = context;
    if ((submission as any).is_archived) {
      return { error: "No puedes editar observaciones de una respuesta archivada." };
    }

    const { data: existing, error: lookupError } = await supabase
      .from("form_submission_admin_comments")
      .select("id, submission_id")
      .eq("id", commentId)
      .eq("submission_id", submissionId)
      .maybeSingle();

    if (lookupError) throw lookupError;
    if (!existing) return { error: "No se encontró la observación." };

    const { error } = await supabase
      .from("form_submission_admin_comments")
      .update({ body: trimmedBody, updated_at: new Date().toISOString() })
      .eq("id", commentId)
      .eq("submission_id", submissionId);

    if (error) throw error;

    await revalidateFormSubmissions((submission as any).form_id);

    return {
      success: true,
      comment: await getSubmissionAdminCommentWithProfile(supabase, commentId),
    };
  } catch (e: any) {
    console.error("[updateFormSubmissionAdminComment]", e);
    return { error: e.message ?? "No se pudo actualizar la observación." };
  }
}

export async function deleteFormSubmissionAdminComment({
  submissionId,
  commentId,
}: {
  submissionId: string;
  commentId: string;
}): Promise<{ success?: true; error?: string }> {
  try {
    if (!submissionId || !commentId) return { error: "Observación inválida." };

    const context = await getManageableSubmission(submissionId);
    if ("error" in context) return { error: context.error };

    const { supabase, submission } = context;
    if ((submission as any).is_archived) {
      return { error: "No puedes eliminar observaciones de una respuesta archivada." };
    }

    const { error } = await supabase
      .from("form_submission_admin_comments")
      .delete()
      .eq("id", commentId)
      .eq("submission_id", submissionId);

    if (error) throw error;

    await revalidateFormSubmissions((submission as any).form_id);

    return { success: true };
  } catch (e: any) {
    console.error("[deleteFormSubmissionAdminComment]", e);
    return { error: e.message ?? "No se pudo eliminar la observación." };
  }
}
