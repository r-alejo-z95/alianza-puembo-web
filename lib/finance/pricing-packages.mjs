import crypto from "crypto";

export const PRICING_MODES = new Set(["fixed", "packages"]);

function toAmount(value) {
  const amount = Math.abs(Number(value ?? 0));
  return Number.isFinite(amount) ? Math.round(amount * 100) / 100 : 0;
}

function toPositiveInt(value) {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) return null;
  return number;
}

export function normalizePricingMode(value) {
  return value === "packages" ? "packages" : "fixed";
}

export function normalizePricingPackages(packages = []) {
  return (Array.isArray(packages) ? packages : [])
    .map((pkg) => {
      const label = String(pkg?.label || "").trim();
      const amount = toAmount(pkg?.amount);
      if (!label || amount <= 0) return null;

      return {
        id: String(pkg?.id || crypto.randomUUID()).trim(),
        label,
        amount,
        participant_count: toPositiveInt(pkg?.participant_count),
        enabled: pkg?.enabled !== false,
      };
    })
    .filter(Boolean);
}

export function normalizeParticipantTemplate(template = []) {
  return (Array.isArray(template) ? template : [])
    .map((field) => {
      const label = String(field?.label || "").trim();
      const type = ["text", "textarea", "number", "date"].includes(field?.type)
        ? field.type
        : "text";
      if (!label) return null;
      return {
        id: String(field?.id || crypto.randomUUID()).trim(),
        label,
        type,
        required: field?.required !== false,
        placeholder: String(field?.placeholder || "").trim() || null,
      };
    })
    .filter(Boolean);
}

export function validatePricingConfiguration(values = {}) {
  const mode = normalizePricingMode(values.pricing_mode);
  const errors = [];

  if (mode === "fixed") {
    if (toAmount(values.total_amount) <= 0) errors.push("Define el monto total.");
    return { valid: errors.length === 0, errors };
  }

  const activePackages = normalizePricingPackages(values.pricing_packages).filter(
    (pkg) => pkg.enabled,
  );
  if (activePackages.length === 0) {
    errors.push("Agrega al menos un paquete de precio activo.");
  }

  if (values.collect_participant_details) {
    const template = normalizeParticipantTemplate(values.participant_template);
    if (template.length === 0) {
      errors.push("Agrega al menos un campo para los datos por participante.");
    }
  }

  return { valid: errors.length === 0, errors };
}

export function formatPackageOptionLabel(pkg) {
  return `${pkg.label} - $${toAmount(pkg.amount).toFixed(2)}`;
}

export function buildPricingFieldOptions(packages = []) {
  return normalizePricingPackages(packages)
    .filter((pkg) => pkg.enabled)
    .map((pkg) => ({
      id: pkg.id,
      value: pkg.id,
      label: formatPackageOptionLabel(pkg),
    }));
}

export function findSelectedPackage(form = {}, selectedPackageId = "") {
  const packages = normalizePricingPackages(form.pricing_packages);
  return packages.find((pkg) => pkg.id === selectedPackageId) || null;
}

export function buildPricingSnapshot({ form = {}, selectedPackageId = null } = {}) {
  const mode = normalizePricingMode(form.pricing_mode);
  if (mode === "fixed") {
    return {
      mode: "fixed",
      amount: toAmount(form.total_amount),
    };
  }

  const pkg = findSelectedPackage(form, String(selectedPackageId || ""));
  if (!pkg || !pkg.enabled) {
    throw new Error(
      "La opción de inscripción ya no está disponible. Recarga el formulario y escoge otra opción.",
    );
  }

  return {
    mode: "packages",
    package_id: pkg.id,
    package_label: pkg.label,
    amount: pkg.amount,
    participant_count: pkg.participant_count,
  };
}

export function getEffectiveExpectedAmount({ form = {}, submission = {}, paymentGroup = null } = {}) {
  const groupAmount = toAmount(paymentGroup?.expected_amount);
  if (groupAmount > 0) return groupAmount;

  const submissionAmount = toAmount(submission?.expected_amount);
  if (submissionAmount > 0) return submissionAmount;

  return toAmount(form?.total_amount);
}

export function calculateGroupExpectedAmount(submissions = []) {
  return (Array.isArray(submissions) ? submissions : [])
    .filter(
      (submission) =>
        !submission?.is_archived && submission?.submission_status !== "cancelled",
    )
    .reduce((sum, submission) => sum + toAmount(submission?.expected_amount), 0);
}

export function flattenParticipantDetailsForExport(participants = [], labelPrefix = "Niño") {
  const output = {};
  (Array.isArray(participants) ? participants : []).forEach((participant, index) => {
    const number = participant?.index || index + 1;
    const answers = participant?.answers && typeof participant.answers === "object"
      ? participant.answers
      : {};
    Object.entries(answers).forEach(([label, value]) => {
      output[`${labelPrefix} ${number} - ${label}`] = value;
    });
  });
  return output;
}
