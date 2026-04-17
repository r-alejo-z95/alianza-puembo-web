function normalizeValue(value) {
  return String(value || "").trim().toLowerCase();
}

export function isFinancialReceiptField({ form, fieldDef, key }) {
  if (!form?.is_financial || !fieldDef) return false;

  const configuredFieldId = form.financial_field_id || null;
  if (configuredFieldId && fieldDef.id === configuredFieldId) {
    return true;
  }

  const financialField = (form.form_fields || []).find((field) => field.id === configuredFieldId);
  const configuredLabel = financialField?.label ?? form.financial_field_label ?? "";
  const normalizedConfiguredLabel = normalizeValue(configuredLabel);

  if (!normalizedConfiguredLabel) return false;

  return (
    normalizeValue(fieldDef.label) === normalizedConfiguredLabel ||
    normalizeValue(key) === normalizedConfiguredLabel
  );
}
