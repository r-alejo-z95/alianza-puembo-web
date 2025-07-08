import { getSessionUser } from "@/lib/auth/getSessionUser";
import { adminPageSection, adminPageHeaderContainer, adminPageTitle, adminPageDescription } from "@/lib/styles";

export default async function AdminHomePage() {
  const user = await getSessionUser();

  return (
    <section className={adminPageSection}>
      <div className={adminPageHeaderContainer}>
        <h1 className={adminPageTitle}>
          Bienvenido al Panel de Administración
        </h1>
        <p className={adminPageDescription}>
          Hola, {user?.user_metadata?.full_name || user?.email || 'Admin'}! Desde aquí podrás gestionar el contenido de la página web.<br />
          Selecciona una opción del menú de la izquierda para comenzar.
        </p>
      </div>
    </section>
  );
}
