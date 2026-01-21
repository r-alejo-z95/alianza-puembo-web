import { createClient } from "@/lib/supabase/server";
import AnalyticsDashboard from "@/components/admin/managers/AnalyticsDashboard";
import { notFound } from "next/navigation";

export default async function FormAnalyticsPage({ params }) {
  const { slug } = await params;
  const supabase = await createClient();

  // 1. Obtener el formulario y sus campos
  const { data: form, error: formError } = await supabase
    .from("forms")
    .select("*, form_fields(*)")
    .eq("slug", slug)
    .single();

  if (formError || !form) {
    return notFound();
  }

  // 2. Obtener todas las respuestas
  const { data: submissions, error: submissionsError } = await supabase
    .from("form_submissions")
    .select("*")
    .eq("form_id", form.id)
    .order("created_at", { ascending: false });

  if (submissionsError) {
    console.error("Error fetching submissions:", submissionsError);
  }

  // Ordenar campos por order_index
  if (form.form_fields) {
    form.form_fields.sort(
      (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <AnalyticsDashboard 
        form={form} 
        submissions={submissions || []} 
      />
    </div>
  );
}
