const OTHER_TEXT_SUFFIX = "__other";

function normalizeText(value) {
  return String(value ?? "").trim();
}

function getOptionValue(option) {
  return option?.value || option?.label || "";
}

function getOptionLabel(option) {
  return option?.label || option?.value || "";
}

function optionMatchesValue(option, value) {
  return value === getOptionValue(option) || value === getOptionLabel(option);
}

export function normalizeChoiceOtherOptions(options = []) {
  let foundOpenOption = false;

  return (Array.isArray(options) ? options : []).map((option) => {
    const allowsOther = Boolean(option?.allows_other) && !foundOpenOption;
    if (allowsOther) foundOpenOption = true;

    return {
      ...option,
      allows_other: allowsOther,
    };
  });
}

export function getChoiceOtherOption(field) {
  if (!["radio", "checkbox"].includes(field?.type || field?.field_type)) {
    return null;
  }

  return (Array.isArray(field?.options) ? field.options : []).find(
    (option) => option?.allows_other,
  ) || null;
}

export function getChoiceOtherTextKey(fieldKey) {
  return `${fieldKey}${OTHER_TEXT_SUFFIX}`;
}

export function isChoiceOtherSelected(field, rawValue) {
  const otherOption = getChoiceOtherOption(field);
  if (!otherOption) return false;

  if (field?.type === "checkbox" || field?.field_type === "checkbox") {
    if (Array.isArray(rawValue)) {
      return rawValue.some((value) => {
        if (optionMatchesValue(otherOption, value)) return true;
        return String(value ?? "").startsWith(`${getOptionLabel(otherOption)}:`);
      });
    }

    if (rawValue && typeof rawValue === "object") {
      return Boolean(
        rawValue[getOptionValue(otherOption)] ||
          rawValue[getOptionLabel(otherOption)],
      );
    }

    return false;
  }

  if (optionMatchesValue(otherOption, rawValue)) return true;
  return String(rawValue ?? "").startsWith(`${getOptionLabel(otherOption)}:`);
}

function getSelectedOptions(field, rawValue) {
  const options = Array.isArray(field?.options) ? field.options : [];
  const fieldType = field?.type || field?.field_type;

  if (fieldType === "checkbox") {
    if (Array.isArray(rawValue)) {
      return options.filter((option) =>
        rawValue.some((value) => optionMatchesValue(option, value)),
      );
    }

    if (rawValue && typeof rawValue === "object") {
      return options.filter(
        (option) =>
          rawValue[getOptionValue(option)] ||
          rawValue[getOptionLabel(option)],
      );
    }

    return [];
  }

  const selected = options.find((option) => optionMatchesValue(option, rawValue));
  return selected ? [selected] : [];
}

export function validateChoiceOtherResponse(field, rawValue, otherText) {
  if (
    isChoiceOtherSelected(field, rawValue) &&
    normalizeText(otherText).length === 0
  ) {
    return {
      valid: false,
      error: "Especifica la otra respuesta.",
    };
  }

  return {
    valid: true,
    error: null,
  };
}

export function validateChoiceOtherAnswers(fields = [], answers = []) {
  const invalidFields = (Array.isArray(fields) ? fields : []).filter((field) => {
    if (!getChoiceOtherOption(field)) return false;

    const answer = (Array.isArray(answers) ? answers : []).find(
      (candidate) =>
        (candidate?.field_id && candidate.field_id === field?.id) ||
        candidate?.label === field?.label ||
        candidate?.key === field?.id,
    );
    if (!answer) return false;

    const answerSelection = Array.isArray(answer.choice_options)
      ? (field?.type || field?.field_type) === "checkbox"
        ? answer.choice_options
        : answer.choice_options[0]
      : answer.value;

    return !validateChoiceOtherResponse(
      field,
      answerSelection,
      answer.other_text,
    ).valid;
  });

  return {
    valid: invalidFields.length === 0,
    fieldLabels: invalidFields.map(
      (field) => field?.label || field?.id || "Campo",
    ),
  };
}

export function buildChoiceSubmissionValue(field, rawValue, otherText) {
  const selectedOptions = getSelectedOptions(field, rawValue);
  const otherOption = getChoiceOtherOption(field);
  const normalizedOtherText =
    otherOption && selectedOptions.includes(otherOption)
      ? normalizeText(otherText)
      : null;

  const choiceOptions = selectedOptions.map(getOptionLabel);
  const displayValues = selectedOptions.map((option) => {
    const label = getOptionLabel(option);
    if (option === otherOption && normalizedOtherText) {
      return `${label}: ${normalizedOtherText}`;
    }
    return label;
  });

  return {
    value:
      (field?.type || field?.field_type) === "checkbox"
        ? displayValues
        : displayValues[0] || "",
    choice_options: choiceOptions,
    other_text: normalizedOtherText,
  };
}

function getStoredChoiceOptions(field, answerValue, answer = {}) {
  if (Array.isArray(answer?.choice_options)) {
    return answer.choice_options;
  }

  const options = Array.isArray(field?.options) ? field.options : [];
  const fieldType = field?.type || field?.field_type;
  if (
    fieldType === "checkbox" &&
    answerValue &&
    typeof answerValue === "object" &&
    !Array.isArray(answerValue)
  ) {
    return options
      .filter(
        (option) =>
          answerValue[getOptionValue(option)] ||
          answerValue[getOptionLabel(option)],
      )
      .map(getOptionLabel);
  }

  const otherOption = getChoiceOtherOption(field);
  const otherLabel = otherOption ? getOptionLabel(otherOption) : "";
  const values = Array.isArray(answerValue) ? answerValue : [answerValue];

  return values
    .filter((value) => value !== null && value !== undefined && value !== "")
    .map((value) => {
      const text = String(value);
      if (otherLabel && text.startsWith(`${otherLabel}:`)) return otherLabel;
      const matchingOption = options.find((option) =>
        optionMatchesValue(option, value),
      );
      if (matchingOption) return getOptionLabel(matchingOption);
      return text;
    });
}

export function getChoiceEditState(field, answerValue, answer = {}) {
  const choiceOptions = getStoredChoiceOptions(field, answerValue, answer);

  return {
    value:
      (field?.type || field?.field_type) === "checkbox"
        ? choiceOptions
        : choiceOptions[0] || "",
    other_text: normalizeText(answer?.other_text),
  };
}

export function getChoiceAnalyticsValues(field, answerValue, answer = {}) {
  return getStoredChoiceOptions(field, answerValue, answer);
}
