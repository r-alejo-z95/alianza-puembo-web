export const MAX_FORM_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NUMBER_PATTERN = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;
const SUPPORTED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const REQUIRED_MESSAGE = "Este campo es obligatorio.";

function getFieldType(field) {
  return field?.type || field?.field_type || "text";
}

function parseOptions(options) {
  if (Array.isArray(options)) return options;
  if (typeof options !== "string") return [];

  try {
    const parsed = JSON.parse(options);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getFileCandidate(value) {
  if (!value || typeof value !== "object") return null;
  if (typeof value.length === "number") {
    return value[0] || value.item?.(0) || null;
  }
  if (value._type === "file" || value.mime_type || value.type) return value;
  return null;
}

function getSelectedChoices(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    return Object.entries(value)
      .filter(([, selected]) => selected === true)
      .map(([key]) => key);
  }
  return value === null || value === undefined || value === "" ? [] : [value];
}

function optionMatches(option, value) {
  const candidate = String(value ?? "");
  const optionValue = String(option?.value ?? option?.label ?? "");
  const optionLabel = String(option?.label ?? option?.value ?? "");

  if (candidate === optionValue || candidate === optionLabel) return true;

  return Boolean(
    option?.allows_other &&
      optionLabel &&
      candidate.startsWith(`${optionLabel}:`) &&
      candidate.slice(optionLabel.length + 1).trim(),
  );
}

function isEmptyValue(type, value) {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (type === "checkbox") return getSelectedChoices(value).length === 0;
  if (type === "file" || type === "image") return !getFileCandidate(value);
  return false;
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

function validResult() {
  return { valid: true, error: null };
}

function invalidResult(error) {
  return { valid: false, error };
}

export function validateFieldValue(field, value) {
  const type = getFieldType(field);
  const empty = isEmptyValue(type, value);

  if (empty) {
    return field?.required ? invalidResult(REQUIRED_MESSAGE) : validResult();
  }

  if (type === "text" || type === "textarea") {
    return typeof value === "string"
      ? validResult()
      : invalidResult("Ingresa un texto válido.");
  }

  if (type === "email") {
    return typeof value === "string" && EMAIL_PATTERN.test(value.trim())
      ? validResult()
      : invalidResult("Ingresa un correo electrónico válido.");
  }

  if (type === "number") {
    const candidate =
      typeof value === "number" ? String(value) : String(value).trim();
    return NUMBER_PATTERN.test(candidate) && Number.isFinite(Number(candidate))
      ? validResult()
      : invalidResult("Ingresa un número válido.");
  }

  if (type === "date") {
    return typeof value === "string" && isValidDate(value)
      ? validResult()
      : invalidResult("Ingresa una fecha válida.");
  }

  if (type === "radio" || type === "select") {
    const options = parseOptions(field?.options);
    return options.some((option) => optionMatches(option, value))
      ? validResult()
      : invalidResult("Selecciona una opción válida.");
  }

  if (type === "checkbox") {
    const options = parseOptions(field?.options);
    const selected = getSelectedChoices(value);
    return (
      selected.length > 0 &&
      selected.every((item) =>
        options.some((option) => optionMatches(option, item)),
      )
    )
      ? validResult()
      : invalidResult("Selecciona al menos una opción válida.");
  }

  if (type === "file" || type === "image") {
    const file = getFileCandidate(value);
    const mimeType = String(file?.type || file?.mime_type || "").toLowerCase();
    const size = Number(file?.size ?? file?.size_bytes);
    const supportedType =
      type === "image"
        ? SUPPORTED_IMAGE_MIME_TYPES.has(mimeType)
        : mimeType === "application/pdf" ||
          SUPPORTED_IMAGE_MIME_TYPES.has(mimeType);

    if (!supportedType) {
      return invalidResult(
        type === "image"
          ? "Selecciona una imagen válida."
          : "Selecciona una imagen o PDF válido.",
      );
    }

    return Number.isFinite(size) && size <= MAX_FORM_FILE_SIZE_BYTES
      ? validResult()
      : invalidResult("El archivo no puede superar 5 MB.");
  }

  return validResult();
}

export function createFieldValidationRule(field) {
  return (value) => {
    const result = validateFieldValue(field, value);
    return result.valid || result.error;
  };
}

export function validateSubmissionAnswers(fields = [], answers = []) {
  const availableFields = Array.isArray(fields) ? fields : [];
  const errors = [];

  for (const answer of Array.isArray(answers) ? answers : []) {
    const field =
      availableFields.find(
        (candidate) => candidate?.id && candidate.id === answer?.field_id,
      ) ||
      availableFields.find(
        (candidate) =>
          candidate?.label && candidate.label === answer?.label,
      );

    if (
      !field ||
      ["section", "section_header", "separator"].includes(getFieldType(field))
    ) {
      continue;
    }

    const result = validateFieldValue(field, answer?.value);
    if (!result.valid) {
      errors.push({
        fieldId: field.id,
        label: field.label || field.id || "Campo",
        message: result.error,
      });
    }
  }

  return { valid: errors.length === 0, errors };
}
