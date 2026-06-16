import {
  normalizePricingMode,
  normalizePricingPackages,
} from "../finance/pricing-packages.mjs";

const AUTO_PAYMENT_DESCRIPTION_START = "<!--AUTO_PAYMENT_DESCRIPTION_START-->";
const AUTO_PAYMENT_DESCRIPTION_END = "<!--AUTO_PAYMENT_DESCRIPTION_END-->";

const LEGACY_HTML_PAYMENT_DESCRIPTION_AT_END_REGEX =
  /<p>\s*Debes realizar un pago(?: único)? de \$[\d.,]+(?: a [^<]+?)?\s*(?:Puedes hacerlo en hasta \d+ cuotas?\.\s*)?<\/p>\s*$/i;
const LEGACY_TEXT_PAYMENT_DESCRIPTION_AT_END_REGEX =
  /(?:\s|&nbsp;|<br\s*\/?>|<p>\s*<\/p>)*Debes realizar un pago(?: único)? de \$[\d.,]+(?: a .+?)?\s*(?:Puedes hacerlo en hasta \d+ cuotas?\.\s*)?\s*$/i;

function trimDescription(description) {
  return (description || "").trim();
}

function stripManagedPaymentBlock(description) {
  return description.replace(
    new RegExp(`${AUTO_PAYMENT_DESCRIPTION_START}[\\s\\S]*?${AUTO_PAYMENT_DESCRIPTION_END}`, "g"),
    "",
  );
}

function stripLegacyPaymentBlock(description) {
  return description
    .replace(LEGACY_HTML_PAYMENT_DESCRIPTION_AT_END_REGEX, "")
    .replace(LEGACY_TEXT_PAYMENT_DESCRIPTION_AT_END_REGEX, "")
    .trimEnd();
}

function wrapPaymentBlock(paymentDescription) {
  return `${AUTO_PAYMENT_DESCRIPTION_START}${paymentDescription}${AUTO_PAYMENT_DESCRIPTION_END}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildPaymentDescription(values, bankAccounts = []) {
  if (!values?.is_financial) return null;

  const account = bankAccounts.find((a) => a.id === values.destination_account_id);
  const pricingMode = normalizePricingMode(values.pricing_mode);
  const packages = normalizePricingPackages(values.pricing_packages);
  const amount = `$${Number(values.total_amount || 0).toFixed(2)}`;
  const details = [
    account?.bank_name ? ["Banco", account.bank_name] : null,
    account?.account_holder ? ["Titular", account.account_holder] : null,
    account?.account_type ? ["Tipo", account.account_type] : null,
    account?.account_number ? ["Cuenta", account.account_number] : null,
    account?.ruc ? ["RUC", account.ruc] : null,
  ].filter(Boolean);

  let paymentSummary = `Debes realizar un pago único de ${amount}.`;
  if (pricingMode === "packages") {
    const packageItems = packages
      .filter((pkg) => pkg.enabled)
      .map((pkg) => `${escapeHtml(pkg.label)}: $${Number(pkg.amount).toFixed(2)}`)
      .join("<br />");
    paymentSummary = `Selecciona una opción de inscripción y paga el valor correspondiente.<br />${packageItems}`;
  } else if (values.payment_type === "installments") {
    const installments = values.max_installments ?? 1;
    paymentSummary = `Debes realizar un pago de ${amount}. Puedes hacerlo en hasta ${installments} ${installments === 1 ? "cuota" : "cuotas"}.`;
  }

  if (!details.length) {
    return `<p>${paymentSummary}</p>`;
  }

  const accountDetails = details
    .map(([label, value]) => `<strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}`)
    .join("<br />");

  return `<p>${paymentSummary}</p><p>${accountDetails}</p>`;
}

export function mergeFormDescription(existingDescription, paymentDescription) {
  const baseDescription = stripLegacyPaymentBlock(
    stripManagedPaymentBlock(trimDescription(existingDescription)),
  ).trim();

  if (!paymentDescription) {
    return baseDescription || null;
  }

  if (!baseDescription) {
    return wrapPaymentBlock(paymentDescription);
  }

  return `${baseDescription}${wrapPaymentBlock(paymentDescription)}`;
}
