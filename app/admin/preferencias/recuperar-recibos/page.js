import { verifySuperAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/server";
import { findNameInSubmission } from "@/lib/form-utils";
import RecoveryManager from "@/components/admin/super/RecoveryManager";

export const metadata = { title: "Recuperar Recibos" };

async function getPendingSubmissions() {
  const supabaseAdmin = createAdminClient();

  // 1. Get all submission IDs that already have a payment record
  const { data: processed } = await supabaseAdmin
    .from("form_submission_payments")
    .select("submission_id");

  const processedIds = (processed ?? []).map((r) => r.submission_id);

  // 2. Fetch financial form submissions, excluding already-processed ones
  let query = supabaseAdmin
    .from("form_submissions")
    .select(`
      id,
      created_at,
      data,
      access_token,
      forms!inner(title, slug, financial_field_label, is_financial)
    `)
    .eq("forms.is_financial", true)
    .order("created_at", { ascending: true });

  if (processedIds.length > 0) {
    query = query.not("id", "in", `(${processedIds.join(",")})`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[RecoveryPage] Error fetching pending submissions:", error);
    return [];
  }

  return (data ?? []).map((s) => ({
    id: s.id,
    created_at: s.created_at,
    access_token: s.access_token,
    name: findNameInSubmission(s.data),
    phone: (() => {
      const keys = Object.keys(s.data || {});
      const phoneKey = keys.find((k) => k.toLowerCase().includes("telef") || k.toLowerCase().includes("phone") || k.toLowerCase().includes("número"));
      return phoneKey ? String(s.data[phoneKey] || "") : "";
    })(),
    formTitle: s.forms?.title ?? "",
    formSlug: s.forms?.slug ?? "",
    financialFieldLabel: s.forms?.financial_field_label ?? "",
    expectedFileName: (() => {
      const label = s.forms?.financial_field_label;
      if (!label) return null;
      const field = s.data?.[label];
      return field?.name ?? null;
    })(),
  }));
}

export default async function RecuperarRecibosPage() {
  await verifySuperAdmin();
  const submissions = await getPendingSubmissions();

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-gray-900">Recuperar Recibos</h1>
        <p className="text-sm text-gray-500">
          Inscripciones de formularios financieros sin comprobante procesado. Sube el archivo manualmente para completar el registro.
        </p>
      </div>
      <RecoveryManager submissions={submissions} />
    </div>
  );
}
