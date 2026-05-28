export const FORM_EMAIL_VARIABLES = [
  "nombre",
  "formulario",
  "correo",
  "fecha_registro",
  "link_seguimiento",
  "estado_pago",
  "monto_total",
  "monto_pagado",
  "saldo_pendiente",
];

function formatInEcuador(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("es-EC", {
    timeZone: "America/Guayaquil",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatMoney(value) {
  if (value === "" || value === null || value === undefined) return "";
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));
}

function normalizeText(value) {
  return String(value ?? "").trim();
}

function inferSubmissionName(submission) {
  const answers = Array.isArray(submission?.answers) ? submission.answers : [];
  const nameAnswer = answers.find((answer) => {
    const label = normalizeText(answer?.label || answer?.key).toLowerCase();
    return (
      answer?.type !== "email" &&
      /(nombre|name|participante|inscrito)/i.test(label)
    );
  });

  if (nameAnswer?.value) return normalizeText(nameAnswer.value);

  const data = submission?.data && typeof submission.data === "object"
    ? submission.data
    : {};
  const nameKey = Object.keys(data).find((key) =>
    /(nombre|name|participante|inscrito)/i.test(key),
  );

  return nameKey ? normalizeText(data[nameKey]) : "";
}

export function buildFormEmailVariables({
  form,
  submission,
  financialSummary = null,
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://alianzapuembo.org",
}) {
  const accessToken = submission?.access_token || "";
  const trackingUrl = form?.is_financial && accessToken
    ? `${siteUrl}/inscripcion/${accessToken}`
    : "";
  const name = inferSubmissionName(submission);

  return {
    nombre: name,
    formulario: form?.title || "",
    correo: submission?.notification_email || "",
    fecha_registro: formatInEcuador(submission?.created_at),
    link_seguimiento: trackingUrl,
    estado_pago: financialSummary?.statusLabel || "",
    monto_total: formatMoney(financialSummary?.totalAmount),
    monto_pagado: formatMoney(financialSummary?.amountPaid),
    saldo_pendiente: formatMoney(financialSummary?.remainingBalance),
  };
}

export function renderFormEmailTemplate({ subject, bodyHtml, variables }) {
  const missing = new Set();
  const replaceVariables = (input) =>
    String(input || "").replace(
      /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g,
      (_match, key) => {
        if (!Object.prototype.hasOwnProperty.call(variables || {}, key)) {
          missing.add(key);
          return "";
        }
        return String(variables[key] ?? "");
      },
    );

  return {
    subject: replaceVariables(subject),
    bodyHtml: replaceVariables(bodyHtml),
    missingVariables: [...missing].sort(),
  };
}

export function wrapFormEmailHtml({ title, bodyHtml, ctaLabel, ctaUrl }) {
  const cta = ctaLabel && ctaUrl
    ? `<div style="text-align:center;margin:30px 0;"><a href="${ctaUrl}" style="background-color:#8fc641;color:white;padding:15px 25px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">${ctaLabel}</a></div>`
    : "";

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
      <div style="background-color:#000;padding:20px;text-align:center;">
        <img src="https://alianzapuembo.org/brand/logo-puembo-white.png" alt="Alianza Puembo" style="height:40px;">
      </div>
      <div style="padding:40px;">
        <h2 style="color:#8fc641;margin-top:0;">${title}</h2>
        ${bodyHtml}
        ${cta}
        <hr style="border:0;border-top:1px solid #eee;margin:30px 0;" />
        <p style="font-size:14px;color:#666;">Atentamente,<br/><strong>Equipo Alianza Puembo</strong></p>
      </div>
    </div>
  `;
}
