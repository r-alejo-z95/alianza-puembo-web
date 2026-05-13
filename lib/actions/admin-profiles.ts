"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createAdminClient, createClient } from "@/lib/supabase/server";

const TEAM_PROFILE_FIELDS = new Set([
  "full_name",
  "perm_events",
  "perm_news",
  "perm_lom",
  "perm_comunidad",
  "perm_forms",
  "perm_finanzas",
  "perm_internal_forms",
  "notify_email_prayer",
  "notify_dash_prayer",
  "notify_email_contact",
  "notify_dash_contact",
  "notify_email_internal",
  "notify_dash_internal",
]);

function normalizeTeamProfileValue(field: string, value: unknown) {
  if (field === "full_name") {
    const fullName = typeof value === "string" ? value.trim() : "";
    if (!fullName) return { ok: false as const, error: "El nombre no puede quedar vacío." };
    return { ok: true as const, value: fullName };
  }

  if (typeof value !== "boolean") {
    return { ok: false as const, error: "Valor de perfil no permitido." };
  }

  return { ok: true as const, value };
}

async function getCurrentUserAndProfile() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { user: null, profile: null, error: "Sesión no encontrada." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, is_super_admin")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return { user: null, profile: null, error: "Perfil no encontrado." };
  }

  return { user, profile, error: null };
}

async function syncAuthFullName(userId: string, fullName: string) {
  const supabaseAdmin = createAdminClient();
  const { data, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userId);

  if (getUserError) {
    throw new Error(getUserError.message);
  }

  const existingMetadata = data.user?.user_metadata ?? {};
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: {
      ...existingMetadata,
      full_name: fullName,
      name: fullName,
    },
  });

  if (error) {
    throw new Error(error.message);
  }
}

function revalidateAdminProfiles() {
  revalidateTag("profiles");
  revalidatePath("/admin");
  revalidatePath("/admin/preferencias");
  revalidatePath("/admin/staff");
}

export async function updateOwnAdminProfile(updates: { full_name?: string }) {
  const { user, error } = await getCurrentUserAndProfile();

  if (error || !user) {
    return { ok: false, error };
  }

  const fullName = updates.full_name?.trim();
  if (!fullName) {
    return { ok: false, error: "El nombre no puede quedar vacío." };
  }

  try {
    const supabaseAdmin = createAdminClient();
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user.id);

    if (profileError) {
      throw new Error(profileError.message);
    }

    await syncAuthFullName(user.id, fullName);
    revalidateAdminProfiles();
    return { ok: true, value: fullName };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "No se pudo actualizar el perfil.",
    };
  }
}

export async function updateTeamProfileField(profileId: string, field: string, value: unknown) {
  const { profile, error } = await getCurrentUserAndProfile();

  if (error || !profile) {
    return { ok: false, error };
  }

  if (!profile.is_super_admin) {
    return { ok: false, error: "No tienes permisos para editar el equipo." };
  }

  if (!TEAM_PROFILE_FIELDS.has(field)) {
    return { ok: false, error: "Campo de perfil no permitido." };
  }

  const normalized = normalizeTeamProfileValue(field, value);
  if (!normalized.ok) {
    return { ok: false, error: normalized.error };
  }

  try {
    const supabaseAdmin = createAdminClient();
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ [field]: normalized.value })
      .eq("id", profileId);

    if (profileError) {
      throw new Error(profileError.message);
    }

    if (field === "full_name" && typeof normalized.value === "string") {
      await syncAuthFullName(profileId, normalized.value);
    }

    revalidateAdminProfiles();
    return { ok: true, value: normalized.value };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "No se pudo actualizar el perfil.",
    };
  }
}
