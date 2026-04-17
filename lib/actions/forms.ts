"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/getSessionUser";
import { slugify } from "@/lib/utils";
import { revalidateForms } from "@/lib/actions/cache";
import { ensureFinanceReceiptsBucket } from "@/lib/finance/storage";

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
