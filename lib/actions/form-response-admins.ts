"use server";

import { revalidatePath } from "next/cache";
import { verifySuperAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/server";

function revalidateFormResponseAdminPreferences() {
  revalidatePath("/admin/preferencias");
  revalidatePath("/admin/formularios");
}

export async function getFormResponseAdminPreferences() {
  await verifySuperAdmin();
  const supabase = createAdminClient();

  const [
    { data: forms, error: formsError },
    { data: profiles, error: profilesError },
    { data: accessRows, error: accessError },
  ] = await Promise.all([
    supabase
      .from("forms")
      .select("id, title, slug, user_id, profiles:profiles!forms_user_id_fkey(full_name, email)")
      .eq("is_archived", false)
      .eq("is_internal", false)
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, full_name, email, is_super_admin")
      .order("full_name", { ascending: true }),
    supabase
      .from("form_response_admins")
      .select("form_id, profile_id, created_at, created_by"),
  ]);

  if (formsError) return { ok: false, error: formsError.message };
  if (profilesError) return { ok: false, error: profilesError.message };
  if (accessError) return { ok: false, error: accessError.message };

  const profilesById = new Map((profiles ?? []).map((profile: any) => [profile.id, profile]));
  const accessRowsByFormId = new Map<string, any[]>();
  (accessRows ?? []).forEach((row: any) => {
    if (!accessRowsByFormId.has(row.form_id)) accessRowsByFormId.set(row.form_id, []);
    accessRowsByFormId.get(row.form_id)?.push({
      ...row,
      profiles: profilesById.get(row.profile_id) ?? null,
    });
  });

  return {
    ok: true,
    forms: (forms ?? []).map((form: any) => ({
      ...form,
      form_response_admins: accessRowsByFormId.get(form.id) ?? [],
    })),
    profiles: (profiles ?? []).filter((profile: any) => !profile.is_super_admin),
  };
}

export async function grantFormResponseAdmin(formId: string, profileId: string) {
  const user = await verifySuperAdmin();
  if (!formId || !profileId) {
    return { ok: false, error: "Formulario o admin inválido." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("form_response_admins").upsert(
    {
      form_id: formId,
      profile_id: profileId,
      created_by: user.id,
    },
    { onConflict: "form_id,profile_id" },
  );

  if (error) return { ok: false, error: error.message };

  revalidateFormResponseAdminPreferences();
  return { ok: true };
}

export async function revokeFormResponseAdmin(formId: string, profileId: string) {
  await verifySuperAdmin();
  if (!formId || !profileId) {
    return { ok: false, error: "Formulario o admin inválido." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("form_response_admins")
    .delete()
    .eq("form_id", formId)
    .eq("profile_id", profileId);

  if (error) return { ok: false, error: error.message };

  revalidateFormResponseAdminPreferences();
  return { ok: true };
}
