export function escapeLookupEmailHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function escapeEmailLookupPattern(value) {
  return String(value ?? "").replace(/[\\%_]/g, "\\$&");
}

export function buildSubmissionLookupEmail({
  form,
  submissions = [],
  siteUrl,
}) {
  const entries = submissions.map((submission) => ({
    createdAt: submission.created_at,
    trackingUrl:
      form.is_financial && submission.access_token
        ? `${String(siteUrl || "").replace(/\/$/, "")}/inscripcion/${submission.access_token}`
        : null,
  }));
  const found = entries.length > 0;
  const suffix = entries.length === 1 ? "" : "es";
  const activeSuffix = entries.length === 1 ? "" : "s";
  const normalizedSiteUrl = String(siteUrl || "").replace(/\/$/, "");

  return {
    found,
    subject: found
      ? `Inscripción encontrada: ${form.title}`
      : `Consulta de inscripción: ${form.title}`,
    title: found
      ? "Inscripción encontrada"
      : "No encontramos una inscripción activa",
    message: found
      ? `Encontramos ${entries.length} inscripción${suffix} activa${activeSuffix} para ${form.title}.`
      : `No encontramos una inscripción activa para ${form.title} con el correo consultado.`,
    entries,
    cta:
      !found && form.enabled
        ? {
            label: "Inscribirme",
            url: `${normalizedSiteUrl}/formularios/${form.slug}`,
          }
        : null,
  };
}
