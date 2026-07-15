import {
  buildChoiceSubmissionValue,
  getChoiceEditState,
  getChoiceOtherOption,
  getChoiceOtherTextKey,
  validateChoiceOtherResponse,
} from "./choice-other.mjs";
import { buildPricingSnapshot } from "../finance/pricing-packages.mjs";
import { validateParticipantDetails } from "./participant-details.mjs";

function normalizeFormKey(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getFieldType(field) {
  return field?.field_type || field?.type || "text";
}

function isFileLikeValue(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      (value._type === "file" || value.financial_receipt_path || value.path || value.url),
  );
}

function getSubmissionAnswer(submission, field) {
  if (!Array.isArray(submission?.answers)) return null;

  const labelKey = normalizeFormKey(field?.label);
  return (
    submission.answers.find((answer) => answer?.field_id && answer.field_id === field?.id) ||
    submission.answers.find((answer) => normalizeFormKey(answer?.label || answer?.key) === labelKey) ||
    null
  );
}

function getDelegatedResponseAdminIds(form) {
  if (!Array.isArray(form?.form_response_admins)) return [];
  return form.form_response_admins
    .map((entry) => entry?.profile_id || entry?.profiles?.id)
    .filter(Boolean);
}

export function hasDelegatedFormResponseAccess(user, form) {
  if (!user?.id || !form?.id) return false;
  return getDelegatedResponseAdminIds(form).includes(user.id);
}

export function canManageSubmissionResponses(user, form) {
  if (!user || !form) return false;
  if (user.is_super_admin) return true;
  if (user.id && form.user_id && user.id === form.user_id) return true;
  return hasDelegatedFormResponseAccess(user, form);
}

export function canViewFormAnalytics(user, form) {
  if (!user || !form) return false;
  if (user.is_super_admin) return true;
  if (user.permissions?.perm_forms) return true;
  return canManageSubmissionResponses(user, form);
}

export function getSubmissionValueForEditableField(submission, field) {
  const answer = getSubmissionAnswer(submission, field);
  if (answer) return answer.value;

  const data = submission?.data && typeof submission.data === "object" ? submission.data : {};
  if (Object.prototype.hasOwnProperty.call(data, field?.id)) return data[field.id];
  if (Object.prototype.hasOwnProperty.call(data, field?.label)) return data[field.label];

  const normalizedLabel = normalizeFormKey(field?.label);
  const matchingKey = Object.keys(data).find((key) => normalizeFormKey(key) === normalizedLabel);
  return matchingKey ? data[matchingKey] : undefined;
}

export function getEditableSubmissionFields(form, submission) {
  return (form?.form_fields || [])
    .filter((field) => {
      const type = getFieldType(field);
      if (["section", "section_header", "separator", "file", "image"].includes(type)) return false;
      return !isFileLikeValue(getSubmissionValueForEditableField(submission, field));
    })
    .sort((a, b) => (a.order_index ?? a.order ?? 0) - (b.order_index ?? b.order ?? 0));
}

export function buildEditableSubmissionValues(form, submission) {
  return getEditableSubmissionFields(form, submission).reduce((values, field) => {
    const answer = getSubmissionAnswer(submission, field);
    const answerValue =
      answer?.value ?? getSubmissionValueForEditableField(submission, field) ?? "";

    if (getChoiceOtherOption(field)) {
      const editState = getChoiceEditState(field, answerValue, answer || {});
      values[field.id] = editState.value;
      values[getChoiceOtherTextKey(field.id)] = editState.other_text;
    } else {
      values[field.id] = answerValue;
    }
    return values;
  }, {});
}

export function buildSubmissionResponseUpdate({ form, submission, values }) {
  const editableFields = getEditableSubmissionFields(form, submission);
  const editableById = new Map(editableFields.map((field) => [field.id, field]));
  const updatedData = {
    ...(submission?.data && typeof submission.data === "object" ? submission.data : {}),
  };
  const seenAnswerFieldIds = new Set();
  const normalizedValues = new Map();

  for (const field of editableFields) {
    if (!Object.prototype.hasOwnProperty.call(values || {}, field.id)) continue;

    if (getChoiceOtherOption(field)) {
      const otherText = values[getChoiceOtherTextKey(field.id)];
      const validation = validateChoiceOtherResponse(
        field,
        values[field.id],
        otherText,
      );
      if (!validation.valid) {
        throw new Error(`${field.label}: ${validation.error}`);
      }

      normalizedValues.set(
        field.id,
        buildChoiceSubmissionValue(field, values[field.id], otherText),
      );
    } else {
      normalizedValues.set(field.id, { value: values[field.id] });
    }
  }

  for (const field of editableFields) {
    if (!normalizedValues.has(field.id)) continue;
    const value = normalizedValues.get(field.id).value;

    if (field.id) updatedData[field.id] = value;
    if (field.label) updatedData[field.label] = value;
  }

  const updatedAnswers = Array.isArray(submission?.answers)
    ? submission.answers.map((answer) => {
        const field =
          (answer?.field_id && editableById.get(answer.field_id)) ||
          editableFields.find((item) => normalizeFormKey(item.label) === normalizeFormKey(answer?.label || answer?.key));

        if (!field || !normalizedValues.has(field.id)) {
          return answer;
        }

        seenAnswerFieldIds.add(field.id);
        return {
          ...answer,
          field_id: answer?.field_id || field.id,
          key: answer?.key || field.id,
          label: answer?.label || field.label,
          type: answer?.type || getFieldType(field),
          ...normalizedValues.get(field.id),
          order_index: answer?.order_index ?? field.order_index ?? null,
        };
      })
    : [];

  for (const field of editableFields) {
    if (seenAnswerFieldIds.has(field.id)) continue;
    if (!normalizedValues.has(field.id)) continue;

    updatedAnswers.push({
      field_id: field.id,
      key: field.id,
      label: field.label,
      type: getFieldType(field),
      ...normalizedValues.get(field.id),
      order_index: field.order_index ?? null,
    });
  }

  return {
    data: updatedData,
    answers: updatedAnswers,
  };
}

function getPricingFieldValue(form, values = {}) {
  const fieldId = form?.pricing_field_id;
  if (!fieldId) return null;
  if (Object.prototype.hasOwnProperty.call(values, fieldId)) return values[fieldId];

  const field = (form?.form_fields || []).find((item) => item.id === fieldId);
  if (field?.label && Object.prototype.hasOwnProperty.call(values, field.label)) {
    return values[field.label];
  }

  return null;
}

export function buildSubmissionFinancialUpdate({ form, submission, values }) {
  if (form?.pricing_mode !== "packages") {
    return {
      expected_amount: submission?.expected_amount ?? null,
      pricing_snapshot: submission?.pricing_snapshot ?? null,
      participant_details: submission?.participant_details ?? null,
    };
  }

  const selectedPackageId = getPricingFieldValue(form, values);
  const pricingSnapshot = buildPricingSnapshot({ form, selectedPackageId });
  const participantDetails = Array.isArray(submission?.participant_details)
    ? submission.participant_details
    : [];
  const expectedParticipantCount = Number(pricingSnapshot.participant_count || 0);

  if (form.collect_participant_details && expectedParticipantCount > 0) {
    const validation = validateParticipantDetails({
      participantDetails,
      participantTemplate: form.participant_template,
      expectedCount: expectedParticipantCount,
    });

    if (!validation.valid) {
      throw new Error(validation.errors.join(" "));
    }

    return {
      expected_amount: pricingSnapshot.amount,
      pricing_snapshot: pricingSnapshot,
      participant_details: validation.value,
    };
  }

  return {
    expected_amount: pricingSnapshot.amount,
    pricing_snapshot: pricingSnapshot,
    participant_details: null,
  };
}
