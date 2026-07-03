const FALLBACK_SUMMARY =
  "Conoce los detalles y completa tu inscripción.";

const PAYMENT_ONLY_PATTERN =
  /^(?:debes realizar un pago|banco:|cuenta:|ruc:|titular:|tipo:\s*(?:ahorros|corriente))/i;

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

export function normalizePortalSearch(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function buildPublicFormSummary(description, maxLength = 180) {
  const withoutAutomaticPayment = String(description || "")
    .replace(
      /<!--AUTO_PAYMENT_DESCRIPTION_START-->[\s\S]*?<!--AUTO_PAYMENT_DESCRIPTION_END-->/gi,
      " ",
    )
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, " ");

  const text = decodeHtmlEntities(withoutAutomaticPayment)
    .split(/\n+/)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .find((part) => part && !PAYMENT_ONLY_PATTERN.test(part));

  if (!text) return FALLBACK_SUMMARY;
  if (text.length <= maxLength) return text;

  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

export function preparePublicFormListings(forms) {
  const lookupForms = [...(forms || [])]
    .map((form) => {
      const { description, ...publicForm } = form;
      return {
        ...publicForm,
        summary: buildPublicFormSummary(description),
      };
    })
    .sort((a, b) => {
      if (Boolean(a.enabled) !== Boolean(b.enabled)) {
        return a.enabled ? -1 : 1;
      }

      return (
        new Date(b.created_at || 0).getTime() -
        new Date(a.created_at || 0).getTime()
      );
    });

  return {
    catalogForms: lookupForms.filter((form) => form.enabled),
    lookupForms,
  };
}

export function filterPublicFormListings(forms, query) {
  const normalized = normalizePortalSearch(query);
  if (!normalized) return forms || [];

  return (forms || []).filter((form) =>
    normalizePortalSearch(
      `${form.title || ""} ${form.summary || ""}`,
    ).includes(normalized),
  );
}
