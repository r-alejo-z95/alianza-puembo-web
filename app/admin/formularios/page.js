import FormManager from '@/components/admin/managers/FormManager';
import { adminPageSection, adminPageHeaderContainer, adminPageTitle, adminPageDescription } from "@/lib/styles.ts";

export const metadata = {
  title: "Gestionar Formularios",
  description: "Administra los formularios personalizados para eventos y registros.",
  robots: {
    index: false,
    follow: false
  },
};

export default function FormulariosAdminPage() {
  return (
    <section className={adminPageSection}>
      <div className={adminPageHeaderContainer}>
        <h1 className={adminPageTitle}>
          Gestionar Formularios
        </h1>
        <p className={adminPageDescription}>
          Crea y administra formularios personalizados para diversos propósitos.
        </p>
      </div>
      <FormManager />
    </section>
  );
}