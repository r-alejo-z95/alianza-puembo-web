import FormManager from "@/components/admin/managers/FormManager";
import DelegatedFormAnalyticsList from "@/components/admin/managers/DelegatedFormAnalyticsList";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/getSessionUser";
import {
  adminPageSection,
  adminPageHeaderContainer,
  adminPageTitle,
  adminPageDescription,
} from "@/lib/styles.ts";
import { getCachedForms, getDelegatedPublicFormsForUser } from "@/lib/data/forms";

export const metadata = {
  title: "Gestionar Formularios",
  description:
    "Administra los formularios personalizados para eventos y registros.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function FormulariosAdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const hasFullFormsAccess = user.is_super_admin || user.permissions?.perm_forms;
  const initialForms = hasFullFormsAccess
    ? await getCachedForms(false)
    : await getDelegatedPublicFormsForUser(user.id);

  if (!hasFullFormsAccess && initialForms.length === 0) {
    redirect("/admin?error=no_permission");
  }

  return (
    <section className={adminPageSection}>
      <header className={adminPageHeaderContainer}>
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px w-12 bg-[var(--puembo-green)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--puembo-green)]">
            Herramientas
          </span>
        </div>
        <h1 className={adminPageTitle}>
          Gestionar{" "}
          <span className="text-[var(--puembo-green)] italic">Formularios</span>
        </h1>
        <p className={adminPageDescription}>
          Administra formularios y registros desde aquí. Todo el flujo operativo vive dentro del panel.
        </p>
      </header>

      {hasFullFormsAccess ? (
        <FormManager initialForms={initialForms} isInternal={false} />
      ) : (
        <DelegatedFormAnalyticsList forms={initialForms} />
      )}
    </section>
  );
}
