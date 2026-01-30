import { getSessionUser } from "./getSessionUser";
import { redirect } from "next/navigation";

/**
 * Verifica si el usuario actual tiene un permiso específico.
 * Si no lo tiene, redirige al dashboard con un mensaje de error.
 * Solo para uso en Server Components.
 */
export async function verifyPermission(permission: string) {
  const user = await getSessionUser();

  // 1. Si no hay usuario, mandarlo al login (doble check)
  if (!user) {
    redirect("/login");
  }

  // 2. Si es Super Admin, tiene pase libre total
  if (user.is_super_admin) {
    return user;
  }

  // 3. Verificar el permiso específico
  const hasPermission = user.permissions?.[permission];

  if (!hasPermission) {
    // Redirigir al dashboard principal si intenta entrar a una zona prohibida
    // Agregamos un searchParam para que el dashboard pueda mostrar un toast de error
    redirect("/admin?error=no_permission");
  }

  return user;
}

/**
 * Verifica si el usuario es Super Admin.
 */
export async function verifySuperAdmin() {
  const user = await getSessionUser();

  if (!user || !user.is_super_admin) {
    redirect("/admin?error=no_permission");
  }

  return user;
}
