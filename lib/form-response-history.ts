import type { Form, FormField, FormSubmission } from "@/lib/data/forms";

type SubmissionAnswer = {
  field_id?: string | null;
  label?: string | null;
  type?: string | null;
  value?: any;
  key?: string | null;
  order_index?: number | null;
};

export type HistoricalFormField = FormField & {
  source?: "current" | "historical";
  historical_labels?: string[];
};

export function normalizeFormKey(value: string | null | undefined): string {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getSubmissionAnswers(submission: FormSubmission): SubmissionAnswer[] {
  if (!Array.isArray(submission.answers)) return [];
  return submission.answers as SubmissionAnswer[];
}

export function getSubmissionAnswerMap(submission: FormSubmission) {
  const byFieldId = new Map<string, SubmissionAnswer>();
  const byLabel = new Map<string, SubmissionAnswer>();

  for (const answer of getSubmissionAnswers(submission)) {
    if (answer.field_id) {
      byFieldId.set(answer.field_id, answer);
    }

    const labelKey = normalizeFormKey(answer.label ?? answer.key);
    if (labelKey) {
      byLabel.set(labelKey, answer);
    }
  }

  return { byFieldId, byLabel };
}

export function getSubmissionValueForField(
  submission: FormSubmission,
  field: Pick<FormField, "id" | "label">,
) {
  const answers = getSubmissionAnswerMap(submission);

  const byId = answers.byFieldId.get(field.id);
  if (byId) return byId.value;

  const byLabel = answers.byLabel.get(normalizeFormKey(field.label));
  if (byLabel) return byLabel.value;

  const legacyData = submission.data ?? {};
  if (Object.prototype.hasOwnProperty.call(legacyData, field.label)) {
    return legacyData[field.label];
  }

  const normalizedMatch = Object.keys(legacyData).find(
    (key) => normalizeFormKey(key) === normalizeFormKey(field.label),
  );
  if (normalizedMatch) return legacyData[normalizedMatch];

  return undefined;
}

export function buildHistoricalFormFields(
  form: Form,
  submissions: FormSubmission[],
): HistoricalFormField[] {
  const currentFields = (form.form_fields ?? []).map((field) => ({
    ...field,
    source: "current" as const,
    historical_labels: [],
  }));

  const fieldsById = new Map(currentFields.map((field) => [field.id, field]));
  const fieldsByLabel = new Map(
    currentFields.map((field) => [normalizeFormKey(field.label), field]),
  );
  const historicalFields: HistoricalFormField[] = [];

  for (const submission of submissions) {
    for (const answer of getSubmissionAnswers(submission)) {
      const label = String(answer.label ?? answer.key ?? "").trim();
      if (!label) continue;

      const byId = answer.field_id ? fieldsById.get(answer.field_id) : undefined;
      const byLabel = fieldsByLabel.get(normalizeFormKey(label));

      if (byId) {
        if (!byId.historical_labels?.includes(label) && normalizeFormKey(byId.label) !== normalizeFormKey(label)) {
          byId.historical_labels = [...(byId.historical_labels ?? []), label];
        }
        continue;
      }

      if (byLabel) {
        if (!byLabel.historical_labels?.includes(label) && normalizeFormKey(byLabel.label) !== normalizeFormKey(label)) {
          byLabel.historical_labels = [...(byLabel.historical_labels ?? []), label];
        }
        continue;
      }

      const historicalId = answer.field_id || `historical-${normalizeFormKey(label)}`;
      if (fieldsById.has(historicalId) || historicalFields.some((field) => field.id === historicalId)) {
        continue;
      }

      const historicalField: HistoricalFormField = {
        id: historicalId,
        form_id: form.id,
        type: answer.type || "text",
        label,
        required: false,
        order_index: answer.order_index ?? Number.MAX_SAFE_INTEGER,
        source: "historical",
      };

      historicalFields.push(historicalField);
    }
  }

  return [...currentFields, ...historicalFields].sort(
    (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
  );
}
