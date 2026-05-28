import AnalyticsDashboard from "@/components/admin/managers/AnalyticsDashboard";
import { notFound, redirect } from "next/navigation";
import {
  getAdminFormBySlugForAnalytics,
  getCachedFormSubmissions,
  getFormEmailCampaigns,
} from "@/lib/data/forms";
import { getSessionUser } from "@/lib/auth/getSessionUser";
import { canManageFormEmailCampaigns } from "@/lib/forms/email-campaigns.mjs";
import { canManageSubmissionResponses, canViewFormAnalytics } from "@/lib/forms/submission-admin.mjs";

export default async function FormAnalyticsPage({ params }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { slug } = await params;

  // 1. Obtener el formulario y sus campos (Cached)
  const form = await getAdminFormBySlugForAnalytics(slug);

  if (!form) {
    return notFound();
  }

  if (!canViewFormAnalytics(user, form)) {
    redirect("/admin?error=no_permission");
  }

  // 2. Obtener todas las respuestas (Cached)
  const submissions = await getCachedFormSubmissions(form.id);
  const emailCampaigns = await getFormEmailCampaigns(form.id);
  const canManageEmails = canManageFormEmailCampaigns(user, form);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <AnalyticsDashboard 
        form={form} 
        submissions={submissions || []} 
        canManageResponses={canManageSubmissionResponses(user, form)}
        emailCampaigns={emailCampaigns}
        canManageEmails={canManageEmails}
      />
    </div>
  );
}
