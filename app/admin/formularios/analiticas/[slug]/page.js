import AnalyticsDashboard from "@/components/admin/managers/AnalyticsDashboard";
import { notFound } from "next/navigation";
import { getFormBySlug, getCachedFormSubmissions } from "@/lib/data/forms";
import { verifyPermission } from "@/lib/auth/guards";
import { canManageSubmissionResponses } from "@/lib/forms/submission-admin.mjs";

export default async function FormAnalyticsPage({ params }) {
  const user = await verifyPermission("perm_forms");
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
        canManageResponses={canManageSubmissionResponses(user, form)}
      />
    </div>
  );
}
