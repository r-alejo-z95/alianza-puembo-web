import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/getSessionUser";
import { createAdminClient } from "@/lib/supabase/server";
import { adminPageSection, adminPageHeaderContainer, adminPageTitle, adminPageDescription } from "@/lib/styles.ts";
import FormSetupWizard from "@/components/admin/forms/builder/FormSetupWizard";

export const metadata = {
  title: "Nuevo Formulario",
  description: "Configura los parámetros iniciales antes de crear preguntas.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NuevoFormularioPage({ searchParams }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const hasFormsPermission = user.is_super_admin || user.permissions?.perm_forms || user.permissions?.perm_internal_forms;
  if (!hasFormsPermission) redirect("/admin?error=no_permission");

  const params = await searchParams;
  const formId = params?.id;
  const internalFromQuery = params?.internal === "true";
  const supabaseAdmin = createAdminClient();

  const [{ data: bankAccounts }, existingFormResult] = await Promise.all([
    supabaseAdmin
      .from("bank_accounts")
      .select("*")
      .eq("is_active", true)
      .order("bank_name", { ascending: true }),
    formId
      ? supabaseAdmin
          .from("forms")
          .select("*")
          .eq("id", formId)
          .eq("is_archived", false)
          .single()
      : Promise.resolve({ data: null }),
  ]);

  const existingForm = existingFormResult?.data ?? null;
  const initialValues = existingForm || { is_internal: internalFromQuery };

  return (
    <section className={adminPageSection}>
      <header className={adminPageHeaderContainer}>
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px w-12 bg-[var(--puembo-green)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--puembo-green)]">
            Formularios
          </span>
        </div>
        <h1 className={adminPageTitle}>
          Configuración Inicial del{" "}
          <span className="text-[var(--puembo-green)] italic">Formulario</span>
        </h1>
        <p className={adminPageDescription}>
          Define visibilidad, límite y datos financieros antes de construir preguntas.
        </p>
      </header>

      <FormSetupWizard bankAccounts={bankAccounts || []} initialValues={initialValues} />
    </section>
  );
}

