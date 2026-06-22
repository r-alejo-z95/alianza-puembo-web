import { normalizeFormKey } from "@/lib/form-response-history";

const identityPatterns = [
  "nombre completo",
  "nombres y apellidos",
  "nombre del participante",
  "nombre del inscrito",
  "participante",
  "inscrito",
  "full name",
];

const noisePatterns = [
  "emergencia",
  "contacto",
  "padre",
  "madre",
  "representante",
  "cedula",
  "email",
  "banco",
  "oficina",
  "papa",
  "mama",
  "amigo",
  "amiga",
  "familiar",
];

function cleanNameKey(value: any): string {
  return normalizeFormKey(value || "")
    .replace(/_/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();
}

function isFileLikeValue(value: any): boolean {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      (value._type === "file" || value.financial_receipt_path || value.receipt_path),
  );
}

function getStructuredNameCandidate(value: any): string {
  if (value === null || value === undefined) return "";

  if (typeof value === "string" || typeof value === "number") {
    return String(value).trim();
  }

  if (Array.isArray(value)) {
    return value.map(getStructuredNameCandidate).find(Boolean) || "";
  }

  if (typeof value !== "object") {
    return String(value).trim();
  }

  if (isFileLikeValue(value)) return "";

  const nestedAnswers = value.answers && typeof value.answers === "object" ? value.answers : null;
  if (nestedAnswers) {
    const entries = Object.entries(nestedAnswers).map(([key, nestedValue]) => ({
      cleanKey: cleanNameKey(key),
      value: nestedValue,
    }));

    const preferred = entries.find((entry) =>
      identityPatterns.some((pattern) => entry.cleanKey === pattern || entry.cleanKey.includes(pattern)),
    );
    if (preferred) return getStructuredNameCandidate(preferred.value);

    const generic = entries.find((entry) =>
      entry.cleanKey.includes("nombre") &&
      !noisePatterns.some((noise) => entry.cleanKey.includes(noise)),
    );
    if (generic) return getStructuredNameCandidate(generic.value);
  }

  for (const key of ["nombre", "full_name", "fullName", "value"]) {
    const candidate = getStructuredNameCandidate(value[key]);
    if (candidate) return candidate;
  }

  return "";
}

/**
 * @description Centralized utility to extract the most likely name of a subscriber from form submission data.
 */
export function findNameInSubmission(input: any): string {
  if (!input) return "Inscrito";

  const data = input?.data && typeof input.data === "object" ? input.data : input;
  const answers = Array.isArray(input?.answers)
    ? input.answers
    : Array.isArray(data?.answers)
      ? data.answers
      : [];

  const cleanEntries = [
    ...answers.map((answer: any, idx: number) => ({
      key: answer?.label || answer?.key || `answer-${idx}`,
      cleanKey: cleanNameKey(answer?.label || answer?.key || ""),
      value: getStructuredNameCandidate(answer?.value),
    })),
    ...Object.keys(data ?? {}).map((k) => ({
      key: k,
      cleanKey: cleanNameKey(k),
      value: getStructuredNameCandidate(data[k]),
    })),
  ].filter((e) => e.value.length > 2);

  const isLikelyName = (val: string) => {
    if (!val || val.includes('@') || val.includes('http')) return false;
    const digits = val.replace(/\D/g, '');
    if (digits.length > val.length * 0.5) return false;
    return val.split(' ').length >= 1; 
  };

  for (const p of identityPatterns) {
    const found = cleanEntries.find(e => (e.cleanKey === p || e.cleanKey.includes(p)) && isLikelyName(e.value));
    if (found) return found.value;
  }

  const genericFound = cleanEntries.find(e => 
    e.cleanKey.includes("nombre") && 
    !noisePatterns.some(noise => e.cleanKey.includes(noise)) &&
    isLikelyName(e.value)
  );

  return genericFound ? genericFound.value : "Inscrito";
}
