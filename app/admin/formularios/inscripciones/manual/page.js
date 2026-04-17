import ManualFinancialRegistrationForm from "@/components/admin/forms/ManualFinancialRegistrationForm";
import { verifyPermission } from "@/lib/auth/guards";
import { adminPageSection } from "@/lib/styles.ts";
import { createClient } from "@/lib/supabase/server";

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

  const supabase = await createClient();
  const { data: forms } = await supabase
    .from("forms")
    .select("id, title, slug, is_financial, financial_field_id, form_fields(*)")
    .eq("is_financial", true)
    .eq("is_archived", false)
    .order("title");

  return (
    <section className={adminPageSection}>
      <ManualFinancialRegistrationForm forms={forms || []} />
    </section>
  );
}
