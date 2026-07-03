import "server-only";

import { Resend } from "resend";
import { wrapFormEmailHtml } from "@/lib/forms/email-rendering.mjs";
import {
  buildSubmissionLookupEmail,
  escapeLookupEmailHtml,
} from "@/lib/forms/submission-lookup-email.mjs";

const resend = new Resend(process.env.RESEND_API_KEY);

type LookupForm = {
  title: string;
  slug: string;
  enabled: boolean | null;
  is_financial: boolean | null;
};

type LookupSubmission = {
  created_at: string | null;
  access_token: string | null;
};

function formatRegistrationDate(value: string | null) {
  if (!value) return "Fecha no disponible";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";

  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "long",
    timeZone: "America/Guayaquil",
  }).format(date);
}

export async function sendFormSubmissionLookupEmail({
  email,
  form,
  submissions,
}: {
  email: string;
  form: LookupForm;
  submissions: LookupSubmission[];
}) {
  try {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://alianzapuembo.org";
    const model = buildSubmissionLookupEmail({
      form,
      submissions,
      siteUrl,
    });

    const registrationRows = model.entries
      .map((entry: { createdAt: string | null; trackingUrl: string | null }) => {
        const trackingLink = entry.trackingUrl
          ? `<a href="${escapeLookupEmailHtml(entry.trackingUrl)}" style="display:inline-block;margin-top:12px;color:#49751d;font-weight:700;text-decoration:underline;">Abrir seguimiento</a>`
          : "";

        return `
          <li style="border:1px solid #e7e7e2;border-radius:10px;margin:10px 0;padding:16px;list-style:none;">
            <strong>Registro del ${escapeLookupEmailHtml(formatRegistrationDate(entry.createdAt))}</strong>
            ${trackingLink}
          </li>
        `;
      })
      .join("");

    const bodyHtml = `
      <p>${escapeLookupEmailHtml(model.message)}</p>
      ${registrationRows ? `<ul style="margin:20px 0;padding:0;">${registrationRows}</ul>` : ""}
      <p style="font-size:13px;color:#777;margin-top:24px;">
        Si no realizaste esta consulta, puedes ignorar este correo.
      </p>
    `;

    const result = await resend.emails.send({
      from: "Iglesia Alianza Puembo <notificaciones@alianzapuembo.org>",
      to: [email],
      subject: String(model.subject).replace(/[\r\n]+/g, " "),
      html: wrapFormEmailHtml({
        title: escapeLookupEmailHtml(model.title),
        bodyHtml,
        ctaLabel: model.cta
          ? escapeLookupEmailHtml(model.cta.label)
          : undefined,
        ctaUrl: model.cta
          ? escapeLookupEmailHtml(model.cta.url)
          : undefined,
      }),
    });

    if (result.error) {
      throw result.error;
    }

    return { success: true as const };
  } catch (error) {
    console.error("[sendFormSubmissionLookupEmail]", error);
    return { success: false as const, error };
  }
}
