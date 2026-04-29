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

interface FormSetupValues {
  id?: string | null;
  title: string;
  is_internal: boolean;
  max_responses: number;
  is_financial: boolean;
  payment_type?: "single" | "installments" | null;
  max_installments?: number | null;
  total_amount?: number | null;
  destination_account_id?: string | null;
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

    const payload: Record<string, any> = {
      title: values.title.trim(),
      is_internal: values.is_internal,
      max_responses: values.max_responses,
      is_financial: values.is_financial,
      payment_type: values.is_financial ? (values.payment_type ?? "single") : null,
      max_installments:
        values.is_financial && values.payment_type === "installments"
          ? (values.max_installments ?? null)
          : null,
      total_amount: values.is_financial ? (values.total_amount ?? null) : null,
      destination_account_id: values.is_financial
        ? (values.destination_account_id ?? null)
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

async function getManageableSubmission(submissionId: string) {
  const user = await getSessionUser();
  if (!user) return { error: "Sesión expirada. Vuelve a iniciar sesión." };

  if (!user.is_super_admin && !user.permissions?.perm_forms) {
    return { error: "No tienes permisos para gestionar respuestas." };
  }

  const supabase = createAdminClient();
  const { data: submission, error: submissionError } = await supabase
    .from("form_submissions")
    .select("id, form_id, data, answers, is_archived")
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

  if (!canManageSubmissionResponses(user, form)) {
    return { error: "Solo el creador del formulario o un super admin puede modificar estas respuestas." };
  }

  return { supabase, submission, form };
}

async function getManageableForm(formId: string) {
  const user = await getSessionUser();
  if (!user) return { error: "Sesión expirada. Vuelve a iniciar sesión." };

  if (!user.is_super_admin && !user.permissions?.perm_forms) {
    return { error: "No tienes permisos para gestionar respuestas." };
  }

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

  if (!canManageSubmissionResponses(user, form)) {
    return { error: "Solo el creador del formulario o un super admin puede modificar estas respuestas." };
  }

  return { supabase, form };
}

async function getSubmissionWithRelations(supabase: any, submissionId: string) {
  const { data, error } = await supabase
    .from("form_submissions")
    .select("*, profiles:profiles!form_submissions_user_id_fkey(*), form_submission_payments(*)")
    .eq("id", submissionId)
    .maybeSingle();

  if (error) {
    console.error("[getSubmissionWithRelations] lookup failed:", error);
    return null;
  }

  return data;
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
      .select("*, profiles:profiles!form_submissions_user_id_fkey(*), form_submission_payments(*)")
      .eq("form_id", formId)
      .eq("is_archived", true)
      .order("archived_at", { ascending: false });

    if (error) throw error;

    return { submissions: data ?? [] };
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

    const { error } = await supabase
      .from("form_submissions")
      .delete()
      .eq("id", submissionId)
      .eq("form_id", (submission as any).form_id);

    if (error) throw error;

    await revalidateFormSubmissions((submission as any).form_id);

    return { success: true };
  } catch (e: any) {
    console.error("[permanentlyDeleteFormSubmissionResponse]", e);
    return { error: e.message ?? "No se pudo eliminar definitivamente la respuesta." };
  }
}
