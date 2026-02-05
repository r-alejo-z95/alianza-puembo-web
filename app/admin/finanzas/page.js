import { createClient } from "@/lib/supabase/server";
import { ReconciliationManager } from "@/components/admin/finance/ReconciliationManager";
import { verifyPermission } from "@/lib/auth/guards";
import {
  adminPageSection,
  adminPageHeaderContainer,
  adminPageTitle,
  adminPageDescription,
} from "@/lib/styles.ts";

export const metadata = {
  title: "Finanzas y Conciliación | Alianza Puembo",
  description: "Auditoría financiera y conciliación bancaria inteligente.",
};

export default async function ReconciliationPage() {
  await verifyPermission("perm_finanzas");

  const supabase = await createClient();

  const { data: financialForms } = await supabase
    .from("forms")
    .select("id, title, financial_field_label")
    .eq("is_financial", true)
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  const forms = financialForms || [];

  return (
    <section className={adminPageSection}>
      <header className={adminPageHeaderContainer}>
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px w-12 bg-[var(--puembo-green)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--puembo-green)]">
            Conciliación
          </span>
        </div>
        <h1 className={adminPageTitle}>
          Gestión{" "}
          <span className="text-[var(--puembo-green)] italic">Financiera</span>
        </h1>
        <p className={adminPageDescription}>
          Control de ingresos. Cruza información de formularios con extractos bancarios.
        </p>
      </header>

      <ReconciliationManager forms={forms} />
    </section>
  );
}
