import { createClient } from "@/lib/supabase/server";
import { User } from "@supabase/supabase-js";

export type Permissions = {
  perm_events: boolean;
  perm_news: boolean;
  perm_lom: boolean;
  perm_comunidad: boolean;
  perm_forms: boolean;
}

export type AdminUser = User & {
  is_super_admin: boolean;
  permissions: Permissions;
};

export async function getSessionUser(): Promise<AdminUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Obtener perfil para los permisos
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return {
    ...user,
    is_super_admin: !!profile.is_super_admin,
    permissions: {
      perm_events: !!profile.perm_events,
      perm_news: !!profile.perm_news,
      perm_lom: !!profile.perm_lom,
      perm_comunidad: !!profile.perm_comunidad,
      perm_forms: !!profile.perm_forms,
    },
  };
}