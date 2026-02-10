import AnalyticsDashboard from "@/components/admin/managers/AnalyticsDashboard";
import { notFound } from "next/navigation";
import { getFormBySlug, getCachedFormSubmissions } from "@/lib/data/forms";

export default async function FormAnalyticsPage({ params }) {
  const { slug } = await params;

  // 1. Obtener el formulario y sus campos (Cached)
  const form = await getFormBySlug(slug);

  if (!form) {
    return notFound();
  }

  // 2. Obtener todas las respuestas (Cached)
  const submissions = await getCachedFormSubmissions(form.id);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <AnalyticsDashboard 
        form={form} 
        submissions={submissions || []} 
      />
    </div>
  );
}
