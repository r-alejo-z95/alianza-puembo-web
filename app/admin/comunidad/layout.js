import { verifyPermission } from "@/lib/auth/guards";

export default async function ComunidadLayout({ children }) {
  // Verificación de seguridad a nivel de servidor
  await verifyPermission("perm_comunidad");

  return <>{children}</>;
}
