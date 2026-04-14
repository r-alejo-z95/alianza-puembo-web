import FormManager from "@/components/admin/managers/FormManager";
import { FormLandingNoticeDialog } from "@/components/admin/managers/FormLandingNoticeDialog";
import { verifyPermission } from "@/lib/auth/guards";
import {
  adminPageSection,
  adminPageHeaderContainer,
  adminPageTitle,
  adminPageDescription,
} from "@/lib/styles.ts";
import { getCachedForms } from "@/lib/data/forms";

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
  await verifyPermission("perm_forms");

  const initialForms = await getCachedForms(false);

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

      <FormLandingNoticeDialog />

      <FormManager initialForms={initialForms} isInternal={false} />
    </section>
  );
}
