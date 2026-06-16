import {
  buildChoiceSubmissionValue,
  getChoiceOtherOption,
  getChoiceOtherTextKey,
  validateChoiceOtherResponse,
} from "../forms/choice-other.mjs";

const STRUCTURAL_FIELD_TYPES = new Set(["section", "section_header", "separator"]);
const UNSUPPORTED_UPLOAD_FIELD_TYPES = new Set(["file", "image"]);

export function normalizeFieldOptions(options) {
  if (!options) return [];
  if (typeof options === "string") {
    try {
      return JSON.parse(options);
    } catch {
      return [];
    }
  }
  return Array.isArray(options) ? options : [];
}

function normalizeCheckboxValue(field, rawValue) {
  const options = normalizeFieldOptions(field.options);
  const source =
    rawValue && typeof rawValue === "object" && !Array.isArray(rawValue) ? rawValue : {};

  return options.reduce((acc, option) => {
    const key = option.value || option.label;
    if (!key) return acc;
    acc[key] = Boolean(source[key]);
    return acc;
  }, {});
}

export function normalizeManualFieldValue(field, rawValue) {
  if (field?.type === "checkbox") {
    return normalizeCheckboxValue(field, rawValue);
  }
  return rawValue ?? null;
}

function isMeaningfullyFilled(field, value) {
  if (field?.type === "checkbox") {
    return Boolean(
      value &&
        typeof value === "object" &&
        Object.values(value).some((entry) => entry === true),
    );
  }

  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  return value !== null && value !== undefined && value !== "";
}

export function getManualSubmissionFields(fields = []) {
  return fields.filter(
    (field) =>
      !STRUCTURAL_FIELD_TYPES.has(field?.type) &&
      !UNSUPPORTED_UPLOAD_FIELD_TYPES.has(field?.type),
  );
}

export function validateManualRegistrationValues(fields = [], values = {}) {
  const missingFieldLabels = [];

  for (const field of getManualSubmissionFields(fields)) {
    const value = normalizeManualFieldValue(field, values[field.id]);
    if (field?.required && !isMeaningfullyFilled(field, value)) {
      missingFieldLabels.push(field.label || field.id || "Campo requerido");
      continue;
    }

    if (
      !validateChoiceOtherResponse(
        field,
        values[field.id],
        values[getChoiceOtherTextKey(field.id)],
      ).valid
    ) {
      missingFieldLabels.push(
        `${field.label || field.id || "Campo"} (especifica la otra respuesta)`,
      );
    }
  }

  return {
    valid: missingFieldLabels.length === 0,
    missingFieldLabels,
  };
}

export function buildManualAnswers(fields = [], values = {}) {
  return getManualSubmissionFields(fields).map((field) => {
    const baseAnswer = {
      field_id: field.id,
      key: field.id,
      label: field.label,
      order_index: field.order_index ?? 0,
    };

    if (getChoiceOtherOption(field)) {
      return {
        ...baseAnswer,
        ...buildChoiceSubmissionValue(
          field,
          values[field.id],
          values[getChoiceOtherTextKey(field.id)],
        ),
      };
    }

    return {
      ...baseAnswer,
      value: normalizeManualFieldValue(field, values[field.id]),
    };
  });
}

export function buildManualData(fields = [], values = {}) {
  return getManualSubmissionFields(fields).reduce((acc, field) => {
    acc[field.label] = getChoiceOtherOption(field)
      ? buildChoiceSubmissionValue(
          field,
          values[field.id],
          values[getChoiceOtherTextKey(field.id)],
        ).value
      : normalizeManualFieldValue(field, values[field.id]);
    return acc;
  }, {});
}

export function validateManualFinancialForm(form) {
  if (!form?.id) {
    return { valid: false, error: "Formulario no encontrado." };
  }
  if (!form.is_financial) {
    return { valid: false, error: "Solo se permiten inscripciones manuales para formularios financieros." };
  }
  if (form.is_archived) {
    return { valid: false, error: "No se puede registrar una inscripción manual en un formulario archivado." };
  }
  return { valid: true };
}
