import ManualFinancialRegistrationForm from "@/components/admin/forms/ManualFinancialRegistrationForm";
import { verifyPermission } from "@/lib/auth/guards";
import { adminPageSection } from "@/lib/styles.ts";
import { createAdminClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Inscripción Manual",
  description: "Registro administrativo para efectivo, tarjeta y beca.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ManualFinancialRegistrationPage() {
  await verifyPermission("perm_forms");

  const supabase = createAdminClient();
  const { data: forms, error } = await supabase
    .from("forms")
    .select("id, title, slug, is_financial, financial_field_id, form_fields!form_id(*)")
    .eq("is_financial", true)
    .eq("is_archived", false)
    .order("title");

  if (error) {
    console.error("[ManualFinancialRegistrationPage] Error cargando formularios:", error);
  }

  return (
    <section className={adminPageSection}>
      <ManualFinancialRegistrationForm forms={forms || []} />
    </section>
  );
}
